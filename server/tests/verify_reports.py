"""Inspect exported Office files and compare with independently queried SQL totals."""
import io
import json
import sys
from pathlib import Path
from zipfile import ZipFile

import openpyxl
from docx import Document


def numbers(row, numbered=False):
    offset = 2 if numbered else 1
    return [int(row[offset] or 0), int(row[offset + 1] or 0), int(row[offset + 3] or 0)]


def check_summary(data, expected_count, recalculated=False):
    workbook = openpyxl.load_workbook(io.BytesIO(data), data_only=True)
    sheet = workbook.worksheets[0]
    assert sheet.max_column == 24
    assert sheet.max_row - 1 == expected_count
    assert sheet.cell(1, 24).value == "Название школы"
    assert sheet.freeze_panes == "D2"
    rows = list(sheet.iter_rows(min_row=2, values_only=True))
    for row in rows:
        assert row[1] == row[2]
        assert row[7].year >= 1900 and row[14].year >= 2025
        assert row[23], "School name must be exported"
        assert row[15] in ("да", "нет", "неявка", None)
        if recalculated:
            assert row[15] in ("да", "нет")
    if recalculated:
        sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "reports"))
        from migrant_reports.models import MULTIPLICITY_ORDER
        by_person = {}
        for row in rows:
            by_person.setdefault(row[1], []).append(row)
        for attempts in by_person.values():
            for index, row in enumerate(sorted(attempts, key=lambda row: row[14])):
                assert row[9] == MULTIPLICITY_ORDER[index]
    workbook.close()


def verify(directory):
    checks = 0
    for case in json.loads((directory / "expected.json").read_text(encoding="utf-8")):
        label = case["label"]
        metrics = case["metrics"]
        metric = lambda category: next(row for row in metrics if row["category"] == category)
        doc = Document(directory / f"{label}-analytical.docx")
        assert len(doc.tables) in (10, 11)
        if case.get("upcoming"):
            assert len(doc.tables) == 11
            values = next([cell.text for cell in row.cells] for row in doc.tables[10].rows[2:] if row.cells[0].text.strip() == "Общий итог")
            assert int(values[1]) == case["upcoming"]
            checks += 1
        for table_index, category in [(0, "children"), (1, "children"), (2, "children"), (3, "children"), (4, "special"), (5, "repeat"), (6, "repeat"), (7, "attempts")]:
            table = doc.tables[table_index]
            totals = next([cell.text for cell in row.cells] for row in table.rows[1:] if any(cell.text.strip() == "Общий итог" for cell in row.cells))
            wanted = metric(category)
            assert numbers(totals, table_index in (0, 2, 5, 7)) == [wanted["total"],wanted["yes"],wanted["no"]], (label, category, totals, wanted)
            checks += 1
        for table_index, category, numbered in [(0,"area",True),(1,"grade",False),(2,"country",True)]:
            for wanted in [item for item in metrics if item["category"] == category]:
                # The original reporting engine canonicalizes country aliases.
                sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "reports"))
                from migrant_reports.models import normalize_country
                group_label = normalize_country(wanted["label"]) if category == "country" else wanted["label"]
                aliases = [m for m in metrics if m["category"] == category and (normalize_country(m["label"]) if category == "country" else m["label"]) == group_label]
                values = next([cell.text for cell in row.cells] for row in doc.tables[table_index].rows if row.cells[1 if numbered else 0].text == group_label)
                assert numbers(values, numbered) == [sum(m[key] for m in aliases) for key in ("total","yes","no")], (label,category,group_label)
                checks += 1
        for table_index in (8,9):
            values = next([cell.text for cell in row.cells] for row in doc.tables[table_index].rows if any(cell.text == "Общий итог" for cell in row.cells))
            assert int(values[-1]) == metric("trajectory")["total"]
        workbook = openpyxl.load_workbook(directory / f"{label}-statistics.xlsx", data_only=True)
        for day in case["daily"]:
            title = ".".join(reversed(day["date"].split("-")))
            sheet = workbook[title]
            total = next(row for row in sheet.iter_rows(values_only=True) if row[0] == "Общий итог")
            assert numbers(total) == [day["total"],day["yes"],day["no"]]
            checks += 1
        control = case["options"]["endDate"]
        suffix = ".".join(reversed(control[2:].split("-")))
        child_sheet = next(s for s in workbook if s.title.startswith("весь период_дети") and suffix in s.title)
        total = next(row for row in child_sheet.iter_rows(min_row=2, values_only=True) if row[1] == "Общий итог")
        assert numbers(total, True) == [metric("children")[key] for key in ("total","yes","no")]
        # All output cells must contain saved values without Excel error markers.
        for sheet in workbook:
            for row in sheet:
                for cell in row:
                    assert cell.data_type != "e", (sheet.title,cell.coordinate,cell.value)
        workbook.close()
        if case["options"]["recalculate"]:
            with ZipFile(directory / f"{label}-summary.zip") as archive:
                assert len(archive.namelist()) == 2
                check_summary(archive.read("Сводная.xlsx"),case["summary"]["original"])
                check_summary(archive.read("Сводная с пересчитанной кратностью.xlsx"),case["summary"]["recalculated"],True)
        else:
            check_summary((directory / f"{label}-summary.xlsx").read_bytes(),case["summary"]["original"])
        checks += 4
    print(f"Passed {checks} SQL/Office comparisons across full, filtered and recalculated reports")


if __name__ == "__main__":
    verify(Path(sys.argv[1]))
