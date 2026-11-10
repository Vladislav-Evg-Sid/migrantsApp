from __future__ import annotations

from collections import defaultdict
from datetime import date
from pathlib import Path
import re
import math
from typing import Sequence

from openpyxl import Workbook
from openpyxl.styles import PatternFill
from openpyxl.utils import get_column_letter

from .calculations import (
    build_daily_mo_country_grade,
    build_daily_mo_grade,
    build_flat_summary,
    build_hierarchical_summary,
    build_repeat_by_date,
    build_repeated_whole_period,
    build_status_summary,
    build_trajectory_pool,
    build_waiting_by_mo_status,
)
from .data_loader import SourceDataset
from .models import format_month_title, format_ru_date, format_short_ru, number_rows, percent_text
from .styles import FAIL_FILL, GREEN_FILL, GROUP_FILL, PASS_FILL, format_excel_cell, style_excel_row


def autosize_sheet(sheet) -> None:
    widths: dict[int, int] = defaultdict(int)
    for row in sheet.iter_rows():
        for cell in row:
            if cell.value is not None:
                widths[cell.column] = max(widths[cell.column], min(len(str(cell.value)) + 2, 45))
    for column, width in widths.items():
        sheet.column_dimensions[get_column_letter(column)].width = width
    # Excel does not auto-fit wrapped row heights when opening generated files.
    for row in sheet.iter_rows():
        lines = 1
        for cell in row:
            if cell.value is None:
                continue
            width = sheet.column_dimensions[get_column_letter(cell.column)].width or 12
            for merged in sheet.merged_cells.ranges:
                if cell.coordinate in merged:
                    width = sum(sheet.column_dimensions[get_column_letter(col)].width or 12
                                for col in range(merged.min_col, merged.max_col + 1))
                    break
            lines = max(lines, sum(max(1, math.ceil(len(line) / max(1, width * .9)))
                                   for line in str(cell.value).splitlines()))
        sheet.row_dimensions[row[0].row].height = max(18, lines * 15 + 4)


def fit_sheet_title(title: str) -> str:
    if len(title) > 31 and re.search(r"\d{2}\.\d{2}\.\d{2}$", title):
        return title[:22] + " " + title[-8:]
    return title[:31]


def excel_zero_blank(value: object) -> object:
    if value in {0, 0.0, "0", "0%"}:
        return ""
    return value


def excel_percent_text(value: int, total: int) -> str:
    return "" if value == 0 else percent_text(value, total).replace("%", "")


def next_month_title_name(control_date: date) -> str:
    if control_date.month == 12:
        return format_month_title(date(control_date.year + 1, 1, 1))
    return format_month_title(date(control_date.year, control_date.month + 1, 1))


def class_header(grade: int) -> str:
    return f"{grade} класс"


def create_yes_no_summary_sheet(
    workbook: Workbook,
    title: str,
    rows: Sequence[dict],
    *,
    numbered: bool = False,
    first_header: str = "Названия строк",
) -> None:
    sheet = workbook.create_sheet(fit_sheet_title(title))
    rows = number_rows(rows) if numbered else list(rows)
    headers = (
        (["№ п/п"] if numbered else [])
        + [
            first_header,
            "Общий итог",
            "Положительный результат",
            "%",
            "Отрицательный результат",
            "%",
        ]
    )
    has_groups = any(row.get("level", 0) > 0 for row in rows)
    for col, header in enumerate(headers, start=1):
        sheet.cell(1, col, header)
        format_excel_cell(sheet.cell(1, col), header=True)
    for row_index, row in enumerate(rows, start=2):
        values = ([row.get("row_no", "")] if numbered else []) + [
            row["label"],
            excel_zero_blank(row["total"]),
            excel_zero_blank(row["yes"]),
            excel_percent_text(row["yes"], row["total"]),
            excel_zero_blank(row["no"]),
            excel_percent_text(row["no"], row["total"]),
        ]
        label_col = 2 if numbered else 1
        for col, value in enumerate(values, start=1):
            sheet.cell(row_index, col, excel_zero_blank(value))
            format_excel_cell(sheet.cell(row_index, col), indent=row.get("level", 0) if col == label_col else 0)
        if row["label"] == "Общий итог":
            style_excel_row(sheet, row_index, len(headers), bold=True)
        elif has_groups and row.get("level", 0) == 0:
            style_excel_row(sheet, row_index, len(headers), bold=True, fill=GROUP_FILL, first_col_indent=0)
    sheet.freeze_panes = "A2"
    autosize_sheet(sheet)


def create_count_sheet(
    workbook: Workbook,
    title: str,
    rows: Sequence[dict],
    first_header: str,
    second_header: str,
    *,
    numbered: bool = False,
) -> None:
    sheet = workbook.create_sheet(fit_sheet_title(title))
    headers = (["№ п/п"] if numbered else []) + [first_header, second_header]
    for col, header in enumerate(headers, start=1):
        sheet.cell(1, col, header)
        format_excel_cell(sheet.cell(1, col), header=True)

    max_level = max((row.get("level", 0) for row in rows), default=0)
    body_rows = [row for row in rows if row["label"] != "Общий итог"]
    total_row = next((row for row in rows if row["label"] == "Общий итог"), None)
    prepared_rows = number_rows(body_rows) if numbered else body_rows
    if total_row:
        prepared_rows.append(total_row)

    for row_index, row in enumerate(prepared_rows, start=2):
        values = (
            ["" if row["label"] == "Общий итог" else row.get("row_no", ""), row["label"], excel_zero_blank(row["count"])]
            if numbered
            else [row["label"], excel_zero_blank(row["count"])]
        )
        label_col = 2 if numbered else 1
        for col, value in enumerate(values, start=1):
            sheet.cell(row_index, col, value)
            format_excel_cell(sheet.cell(row_index, col), indent=row.get("level", 0) if col == label_col else 0)
        max_col = len(headers)
        if row["label"] == "Общий итог":
            style_excel_row(sheet, row_index, max_col, bold=True)
        elif row.get("level", 0) == 0 and max_level > 0:
            style_excel_row(sheet, row_index, max_col, bold=True, fill=GROUP_FILL)
        elif row.get("level", 0) == 1 and max_level > 1:
            style_excel_row(sheet, row_index, max_col, bold=True, first_col_indent=1 if not numbered else 0)
    sheet.freeze_panes = "A2"
    autosize_sheet(sheet)


def create_grade_sheet(workbook: Workbook, title: str, grades: Sequence[int], rows: Sequence[dict], *, first_header: str = "Названия строк") -> None:
    sheet = workbook.create_sheet(fit_sheet_title(title))
    base_headers = [first_header, "Общий итог", "да", "%", "нет", "%"]
    has_groups = any(row.get("level", 0) > 0 for row in rows)
    for col, header in enumerate(base_headers, start=1):
        sheet.cell(1, col, header)
        format_excel_cell(sheet.cell(1, col), header=True)
        sheet.merge_cells(start_row=1, start_column=col, end_row=2, end_column=col)
        format_excel_cell(sheet.cell(2, col), header=True)
    col = 7
    for grade in grades:
        sheet.merge_cells(start_row=1, start_column=col, end_row=1, end_column=col + 1)
        sheet.cell(1, col, class_header(grade))
        sheet.cell(2, col, "да")
        sheet.cell(2, col + 1, "нет")
        format_excel_cell(sheet.cell(1, col), header=True)
        format_excel_cell(sheet.cell(2, col), header=True)
        format_excel_cell(sheet.cell(2, col + 1), header=True)
        col += 2
    for row_index, row in enumerate(rows, start=3):
        values = [
            row["label"],
            excel_zero_blank(row["total"]),
            excel_zero_blank(row["yes"]),
            excel_percent_text(row["yes"], row["total"]),
            excel_zero_blank(row["no"]),
            excel_percent_text(row["no"], row["total"]),
        ]
        for col, value in enumerate(values, start=1):
            sheet.cell(row_index, col, excel_zero_blank(value))
            format_excel_cell(sheet.cell(row_index, col), indent=row.get("level", 0) if col == 1 else 0)
        col = 7
        for grade in grades:
            sheet.cell(row_index, col, excel_zero_blank(row["grades"][grade]["yes"]))
            sheet.cell(row_index, col + 1, excel_zero_blank(row["grades"][grade]["no"]))
            format_excel_cell(sheet.cell(row_index, col))
            format_excel_cell(sheet.cell(row_index, col + 1))
            col += 2
        max_col = 6 + len(grades) * 2
        if row["label"] == "Общий итог":
            style_excel_row(sheet, row_index, max_col, bold=True)
        elif has_groups and row.get("level", 0) == 0:
            style_excel_row(sheet, row_index, max_col, bold=True, fill=GROUP_FILL)
    sheet.freeze_panes = "A3"
    autosize_sheet(sheet)


def create_attempts_period_sheet(workbook: Workbook, title: str, grades: Sequence[int], rows: Sequence[dict], *, first_header: str = "Названия строк") -> None:
    sheet = workbook.create_sheet(fit_sheet_title(title))
    has_groups = any(row.get("level", 0) > 0 for row in rows)
    headers = [
        first_header,
        "Общий итог",
        "Положительный результат",
        "%",
        "Отрицательный результат",
        "%",
    ]
    for col, header in enumerate(headers, start=1):
        sheet.cell(1, col, header)
        format_excel_cell(sheet.cell(1, col), header=True)
        sheet.merge_cells(start_row=1, start_column=col, end_row=2, end_column=col)
        format_excel_cell(sheet.cell(2, col), header=True)
    col = 7
    for grade in grades:
        sheet.merge_cells(start_row=1, start_column=col, end_row=1, end_column=col + 1)
        sheet.cell(1, col, class_header(grade))
        sheet.cell(2, col, "да")
        sheet.cell(2, col + 1, "нет")
        format_excel_cell(sheet.cell(1, col), header=True)
        format_excel_cell(sheet.cell(2, col), header=True)
        format_excel_cell(sheet.cell(2, col + 1), header=True)
        col += 2
    for row_index, row in enumerate(rows, start=3):
        values = [
            row["label"],
            excel_zero_blank(row["total"]),
            excel_zero_blank(row["yes"]),
            excel_percent_text(row["yes"], row["total"]),
            excel_zero_blank(row["no"]),
            excel_percent_text(row["no"], row["total"]),
        ]
        for col, value in enumerate(values, start=1):
            sheet.cell(row_index, col, excel_zero_blank(value))
            format_excel_cell(sheet.cell(row_index, col), indent=row.get("level", 0) if col == 1 else 0)
        col = 7
        for grade in grades:
            sheet.cell(row_index, col, excel_zero_blank(row["grades"][grade]["yes"]))
            sheet.cell(row_index, col + 1, excel_zero_blank(row["grades"][grade]["no"]))
            format_excel_cell(sheet.cell(row_index, col))
            format_excel_cell(sheet.cell(row_index, col + 1))
            col += 2
        max_col = 6 + len(grades) * 2
        if row["label"] == "Общий итог":
            style_excel_row(sheet, row_index, max_col, bold=True)
        elif has_groups and row.get("level", 0) == 0:
            style_excel_row(sheet, row_index, max_col, bold=True, fill=GROUP_FILL)
    sheet.freeze_panes = "A3"
    autosize_sheet(sheet)


def create_repeat_mix_sheet(workbook: Workbook, title: str, rows: Sequence[dict]) -> None:
    sheet = workbook.create_sheet(fit_sheet_title(title))
    sheet.merge_cells("A1:A2")
    sheet.merge_cells("B1:B2")
    sheet.cell(1, 1, "Названия строк")
    sheet.cell(1, 2, "Общий итог")
    format_excel_cell(sheet.cell(1, 1), header=True)
    format_excel_cell(sheet.cell(1, 2), header=True)
    format_excel_cell(sheet.cell(2, 1), header=True)
    format_excel_cell(sheet.cell(2, 2), header=True)
    col = 3
    multiplicities = ["второй", "третий", "четвертый", "пятый", "шестой", "седьмой", "восьмой"]
    # Preserve the original layout; append later attempts only when present.
    for row in rows:
        for label, counts in row["multiplicities"].items():
            if counts["total"] and label not in multiplicities:
                multiplicities.append(label)
    for multiplicity in multiplicities:
        sheet.merge_cells(start_row=1, start_column=col, end_row=1, end_column=col + 2)
        sheet.cell(1, col, multiplicity.capitalize())
        sheet.cell(2, col, "да")
        sheet.cell(2, col + 1, "нет")
        sheet.cell(2, col + 2, "итог")
        for current_col in range(col, col + 3):
            format_excel_cell(sheet.cell(1, current_col), header=True)
            format_excel_cell(sheet.cell(2, current_col), header=True)
        col += 3
    for row_index, row in enumerate(rows, start=3):
        label = format_ru_date(row["label"]) if row["is_date"] and isinstance(row["label"], date) else row["label"]
        values = [label, excel_zero_blank(row["total"])]
        for multiplicity in multiplicities:
            data = row["multiplicities"].get(multiplicity, {"yes": 0, "no": 0, "total": 0})
            values.extend(
                [
                    excel_zero_blank(data["yes"]),
                    excel_zero_blank(data["no"]),
                    excel_zero_blank(data["total"]),
                ]
            )
        for col, value in enumerate(values, start=1):
            sheet.cell(row_index, col, excel_zero_blank(value))
            format_excel_cell(sheet.cell(row_index, col), indent=0 if row["is_date"] or col != 1 else 1)
        if row["label"] == "Общий итог":
            style_excel_row(sheet, row_index, len(values), bold=True)
        elif row["is_date"]:
            style_excel_row(sheet, row_index, len(values), bold=True, fill=GROUP_FILL)
    sheet.freeze_panes = "A3"
    autosize_sheet(sheet)


def create_repeat_period_sheet(workbook: Workbook, title: str, grades: Sequence[int], rows: Sequence[dict]) -> None:
    sheet = workbook.create_sheet(fit_sheet_title(title))
    clear_fill = PatternFill()
    sheet.merge_cells("A1:A2")
    sheet.merge_cells("B1:B2")
    sheet.merge_cells("C1:C2")
    sheet.merge_cells("D1:E1")
    sheet.merge_cells("F1:G1")
    sheet["A1"] = "Дата тестирования"
    sheet["B1"] = "МО"
    sheet["C1"] = "Итого"
    sheet["D1"] = "прошли"
    sheet["F1"] = "не прошли"
    sheet["D2"] = "кол"
    sheet["E2"] = "%"
    sheet["F2"] = "кол"
    sheet["G2"] = "%"
    format_excel_cell(sheet["A1"], header=False, bold=False, horizontal="center", vertical="center")
    format_excel_cell(sheet["B1"], header=False, bold=False, horizontal="left", vertical="center")
    format_excel_cell(sheet["C1"], header=False, bold=False, fill=GREEN_FILL, horizontal="center", vertical="center")
    format_excel_cell(sheet["D1"], header=False, bold=True, fill=PASS_FILL, horizontal="center", vertical="center")
    format_excel_cell(sheet["D2"], header=False, bold=False, fill=PASS_FILL, horizontal="center", vertical="center")
    format_excel_cell(sheet["E2"], header=False, bold=True, fill=PASS_FILL, horizontal="center", vertical="center")
    format_excel_cell(sheet["F1"], header=False, bold=True, fill=FAIL_FILL, horizontal="center", vertical="center")
    format_excel_cell(sheet["F2"], header=False, bold=False, fill=FAIL_FILL, horizontal="center", vertical="center")
    format_excel_cell(sheet["G2"], header=False, bold=True, fill=FAIL_FILL, horizontal="center", vertical="center")
    sheet["A1"].fill = clear_fill
    sheet["B1"].fill = clear_fill
    col = 8
    for grade in grades:
        sheet.merge_cells(start_row=1, start_column=col, end_row=1, end_column=col + 1)
        sheet.cell(1, col, class_header(grade))
        sheet.cell(2, col, "прошли")
        sheet.cell(2, col + 1, "не прошли")
        format_excel_cell(sheet.cell(1, col), header=False, bold=False, horizontal="center", vertical="center")
        format_excel_cell(sheet.cell(2, col), header=False, bold=False, horizontal="center", vertical="center")
        format_excel_cell(sheet.cell(2, col + 1), header=False, bold=False, horizontal="center", vertical="center")
        sheet.cell(1, col).fill = clear_fill
        sheet.cell(2, col).fill = clear_fill
        sheet.cell(2, col + 1).fill = clear_fill
        col += 2
    for row_index, row in enumerate(rows, start=3):
        values = [
            format_ru_date(row["label"]) if row["is_date"] and isinstance(row["label"], date) else "",
            "" if row["is_date"] else row["label"],
            excel_zero_blank(row["total"]),
            excel_zero_blank(row["yes"]),
            excel_percent_text(row["yes"], row["total"]),
            excel_zero_blank(row["no"]),
            excel_percent_text(row["no"], row["total"]),
        ]
        for grade in grades:
            values.extend([excel_zero_blank(row["grades"][grade]["yes"]), excel_zero_blank(row["grades"][grade]["no"])])
        for col, value in enumerate(values, start=1):
            sheet.cell(row_index, col, excel_zero_blank(value))
            format_excel_cell(sheet.cell(row_index, col), horizontal="center" if col != 2 else "left")
        sheet.cell(row_index, 3).fill = GREEN_FILL
        if row["label"] == "Общий итог":
            style_excel_row(sheet, row_index, len(values), bold=True, first_col_align="center", other_align="center")
        elif row["is_date"]:
            style_excel_row(sheet, row_index, len(values), first_col_align="center", other_align="center")
    sheet.freeze_panes = "A3"
    autosize_sheet(sheet)


def build_statistics_workbook(dataset: SourceDataset, excel_dates: Sequence[date], output_path: Path) -> Path:
    workbook = Workbook()
    workbook.remove(workbook.active)
    selected_dates = sorted(dict.fromkeys(excel_dates))
    for control_date in selected_dates:
        grades, daily_rows = build_daily_mo_grade(dataset.attempts_on(control_date))
        create_grade_sheet(workbook, format_ru_date(control_date), grades, daily_rows, first_header="МО")

        grades, daily_country_rows = build_daily_mo_country_grade(dataset.attempts_on(control_date))
        create_grade_sheet(workbook, f"гражданство_{format_ru_date(control_date)}", grades, daily_country_rows, first_header="МО / Гражданство")

        children = dataset.latest_children_to(control_date)
        create_yes_no_summary_sheet(
            workbook,
            f"весь период_дети {len(children)} на {format_short_ru(control_date)}",
            build_flat_summary(children, lambda item: item.mo),
            numbered=True,
            first_header="МО",
        )
        create_yes_no_summary_sheet(
            workbook,
            f"гражданство_дети {len(children)}_{format_short_ru(control_date)}",
            build_flat_summary(children, lambda item: item.citizenship),
            numbered=True,
            first_header="Гражданство",
        )
        create_yes_no_summary_sheet(
            workbook,
            f"МО_гражданство_дети_{len(children)}_{format_short_ru(control_date)}",
            build_hierarchical_summary(children, "mo", "citizenship"),
            first_header="МО / Гражданство",
        )

        attempts = dataset.attempts_to(control_date)
        grades, attempt_rows = build_daily_mo_country_grade(attempts)
        create_attempts_period_sheet(
            workbook,
            f"весь период_тесты {len(attempts)} на {format_short_ru(control_date)}",
            grades,
            attempt_rows,
            first_header="МО / Гражданство",
        )

    base_date = selected_dates[-1]
    grades, repeated_period_rows = build_repeated_whole_period(dataset.records, base_date)
    create_repeat_period_sheet(workbook, "повторно_весь период чел тест", grades, repeated_period_rows)

    for control_date in selected_dates:
        create_repeat_mix_sheet(
            workbook,
            f"повторно_дети на {format_short_ru(control_date)}",
            build_repeat_by_date(dataset.attempts_to(control_date), control_date),
        )

    trajectory_pool = build_trajectory_pool(dataset.latest_children_to(base_date))
    create_count_sheet(
        workbook,
        f"траектория на {next_month_title_name(base_date)}",
        build_waiting_by_mo_status(trajectory_pool),
        "МО / Статус",
        "Количество",
    )
    create_count_sheet(
        workbook,
        f"статусы_{format_short_ru(base_date)}",
        build_status_summary(trajectory_pool),
        "Статус",
        "Количество",
        numbered=True,
    )

    workbook.save(output_path)
    return output_path
