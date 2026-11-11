"""File generator invoked by Express. Receives a DB snapshot, never connects to DB."""
from __future__ import annotations

import io
import json
import math
import sys
from datetime import date, datetime
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

from migrant_reports.data_loader import SourceDataset
from migrant_reports.excel_builder import build_statistics_workbook
from migrant_reports.models import (
    MULTIPLICITY_ORDER, PersonRecord, normalize_country, normalize_status, normalize_text,
)
from migrant_reports.word_builder import create_doc_report


def optional_date(value):
    if not value:
        return None
    for pattern in ("%Y-%m-%d", "%d.%m.%Y", "%d.%m.%y"):
        try:
            return datetime.strptime(str(value), pattern).date()
        except ValueError:
            pass
    return None


def from_db(row: dict, index: int) -> PersonRecord:
    result = {"Зачет": "да", "Незачет": "нет", "Неявка": "неявка"}.get(row["result"])
    appeal = ""
    if row["appeal_date"]:
        appeal = " / ".join([
            date.fromisoformat(row["appeal_date"]).strftime("%d.%m.%Y"),
            "да" if row["appeal_granted"] else "нет",
            "да" if row["appeal_present"] else "нет",
        ])
    birth_date = date.fromisoformat(row["birth_date"])
    test_date = date.fromisoformat(row["test_date"])
    retest_date = optional_date(row["next_planned_date"])
    # The normalized schema has one participant ID. Both legacy ID columns
    # refer to that ID; exam_id is only an internal deterministic tie breaker.
    values = (
        index, int(row["participant_id"]), int(row["participant_id"]), row["area"],
        row["surname"], row["name"], row["patronymic"], birth_date,
        row["citizenship"], row["multiplicity"], row["school_code"], row["grade"],
        row["ppt_code"], "да" if row["special"] else "нет", test_date, result,
        row["status"], retest_date or row["next_planned_date"], row["confirmed_school_name"],
        row["comment"], row["rcoi_note"], row["ppt_name"], row["school_name"], appeal or None,
    )
    return PersonRecord(
        uid=row["participant_id"], internal_id=str(row["exam_id"]).zfill(20),
        mo=normalize_text(row["area"]), last_name=normalize_text(row["surname"]),
        first_name=normalize_text(row["name"]), middle_name=normalize_text(row["patronymic"]),
        birth_date=birth_date, citizenship=normalize_country(row["citizenship"]),
        multiplicity=normalize_text(row["multiplicity"]).lower(), school_code=str(row["school_code"]),
        grade=row["grade"], test_point_code=str(row["ppt_code"]),
        special_category="да" if row["special"] else "нет", test_date=test_date,
        pass_result=result, status=normalize_status(row["status"]), retest_date=retest_date,
        school_after_citizenship=normalize_text(row["confirmed_school_name"]),
        comment=normalize_text(row["comment"]), rc_comment=normalize_text(row["rcoi_note"]),
        test_point_name=normalize_text(row["ppt_name"]), appeal=appeal, source_row=values,
    )


def summary_workbook(records: list[PersonRecord]) -> bytes:
    layout = json.loads(Path(__file__).with_name("source-layout.json").read_text(encoding="utf-8"))
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = layout["title"]
    sheet.append(layout["headers"])
    for cell in sheet[1]:
        cell.font = Font(name="Calibri", bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor="5B9BD5")
        cell.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")
    sheet.row_dimensions[1].height = 105
    for index, width in enumerate(layout["widths"], 1):
        sheet.column_dimensions[get_column_letter(index)].width = width
    for index, record in enumerate(records, 1):
        values = list(record.source_row)
        values[0] = index
        values[9] = record.multiplicity
        sheet.append(values)
        for cell in sheet[index + 1]:
            cell.alignment = Alignment(wrap_text=True, vertical="top")
            if isinstance(cell.value, str):
                cell.data_type = "s"
        lines = max((sum(max(1, math.ceil(len(line) / (layout["widths"][column] * .9)))
                         for line in str(value).splitlines())
                     for column, value in enumerate(values) if value is not None), default=1)
        sheet.row_dimensions[index + 1].height = max(18, lines * 15 + 4)
        for column in (8, 15, 18):
            sheet.cell(index + 1, column).number_format = "DD.MM.YYYY"
    sheet.freeze_panes = "D2"
    sheet.auto_filter.ref = sheet.dimensions
    sheet.sheet_view.zoomScale = 85
    sheet.print_title_rows = "1:1"
    output = io.BytesIO()
    workbook.save(output)
    return output.getvalue()


def generate(payload: dict, output: Path) -> None:
    options = payload["options"]
    start = date.fromisoformat(options["startDate"])
    end = date.fromisoformat(options["endDate"])
    records = [from_db(row, index) for index, row in enumerate(payload["rows"], 1)]
    source = SourceDataset(Path("database"), records)
    period = [record for record in records if start <= record.test_date <= end]
    if payload["kind"] == "summary":
        original = summary_workbook(period)
        if not options["recalculate"]:
            output.write_bytes(original)
            return
        completed = [record for record in period if record.pass_result in {"да", "нет"}]
        recalculated = SourceDataset._recalculate_multiplicity(completed)
        with ZipFile(output, "w", ZIP_DEFLATED) as archive:
            archive.writestr("Сводная.xlsx", original)
            archive.writestr("Сводная с пересчитанной кратностью.xlsx", summary_workbook(recalculated))
        return

    dataset = source.filtered_by_period(start, end, recalculate_multiplicity=options["recalculate"])
    if payload["kind"] == "analytical":
        create_doc_report(dataset, start, end, output, upcoming_dataset=source)
    elif payload["kind"] == "statistics":
        selected = [date.fromisoformat(value) for value in options["dates"]]
        build_statistics_workbook(dataset, selected, output)
    else:
        raise ValueError("Unknown report")


if __name__ == "__main__":
    generate(json.load(sys.stdin), Path(sys.argv[1]))
