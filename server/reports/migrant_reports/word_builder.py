from __future__ import annotations

from collections import Counter
from datetime import date
from pathlib import Path
from typing import Sequence

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Cm
from docx.oxml import OxmlElement

from .calculations import aggregate_yes_no, build_class_summary, build_flat_summary, build_hierarchical_summary, build_special_summary, build_status_summary, build_trajectory_pool, build_upcoming_rows, build_waiting_by_mo_status, build_waiting_pool
from .data_loader import SourceDataset
from .models import PersonRecord, country_genitive, format_ru_date, join_human, mo_prepositional, percent_text, top_non_total
from .styles import add_doc_paragraph, add_doc_table_caption, add_doc_title, set_doc_header_row, style_doc_cell, style_doc_row

def add_doc_table(document: Document, headers: Sequence[str], rows: Sequence[Sequence[object]], title: str, *, grouped: bool = False, header_variant: str = "dark", row_levels: Sequence[int] | None = None) -> None:
    add_doc_table_caption(document, title)
    table = document.add_table(rows=1, cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_doc_header_row(table.rows[0], headers, variant=header_variant)
    for row_index, row in enumerate(rows):
        cells = table.add_row().cells
        for index, value in enumerate(row):
            cells[index].text = "" if value is None else str(value)
        is_total = any(str(item).strip() == "Общий итог" for item in row if item is not None)
        if row_levels is not None and row_index < len(row_levels):
            indent_level = row_levels[row_index]
        else:
            first_text = str(row[0]) if row else ""
            indent_level = (len(first_text) - len(first_text.lstrip())) // 4
        is_group = grouped and not is_total and indent_level == 0
        style_doc_row(cells, bold=is_total or is_group, shaded=False, first_left=True)
    document.add_paragraph()


def add_doc_upcoming_table(document: Document, rows: Sequence[dict], title: str) -> None:
    add_doc_table_caption(document, title)
    classes = sorted({grade for row in rows for grade in row.get("grade_counts", {})})
    total_columns = 2 + len(classes)
    table = document.add_table(rows=2, cols=total_columns)
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for header in table.rows:
        header._tr.get_or_add_trPr().append(OxmlElement("w:tblHeader"))

    table.cell(0, 0).text = "МО/гражданство/кратность"
    table.cell(0, 1).text = "Общий итог"
    if classes:
        table.cell(0, 2).text = "КЛАССЫ"
    table.cell(0, 0).merge(table.cell(1, 0))
    table.cell(0, 1).merge(table.cell(1, 1))
    if classes:
        table.cell(0, 2).merge(table.cell(0, total_columns - 1))
    style_doc_row(table.rows[0].cells, bold=True, shaded=True, first_left=False, shade_variant="light")
    if classes:
        for index, grade in enumerate(classes, start=2):
            table.cell(1, index).text = str(grade)
            style_doc_cell(table.cell(1, index), bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, shaded=True, shade_variant="light")
        style_doc_cell(table.cell(1, 0), bold=True, align=WD_ALIGN_PARAGRAPH.LEFT, shaded=True, shade_variant="light")
        style_doc_cell(table.cell(1, 1), bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, shaded=True, shade_variant="light")

    for row in rows:
        cells = table.add_row().cells
        cells[0].text = f"{'    ' * row.get('level', 0)}{row['label']}"
        cells[1].text = str(row["count"])
        for offset, grade in enumerate(classes, start=2):
            value = row.get("grade_counts", {}).get(grade)
            cells[offset].text = "" if not value else str(value)
        is_bold = row["label"] == "Общий итог" or row.get("level") == 0
        style_doc_row(cells, bold=is_bold, shaded=False, first_left=True)
    document.add_paragraph()


def rows_for_doc_numbered_yes_no(rows: Sequence[dict]) -> list[list[object]]:
    result = []
    index = 1
    for row in rows:
        if row["label"] == "Общий итог":
            result.append(["", row["label"], row["total"], row["yes"], percent_text(row["yes"], row["total"]), row["no"], percent_text(row["no"], row["total"])])
            continue
        result.append([index, row["label"], row["total"], row["yes"], round(row["yes"] / row["total"] * 100) if row["total"] else 0, row["no"], round(row["no"] / row["total"] * 100) if row["total"] else 0])
        index += 1
    return result


def rows_for_doc_plain_yes_no(rows: Sequence[dict]) -> list[list[object]]:
    result = []
    for row in rows:
        label = f"{'    ' * row.get('level', 0)}{row['label']}"
        yes_pct = round(row["yes"] / row["total"] * 100) if row["total"] else ""
        no_pct = round(row["no"] / row["total"] * 100) if row["total"] else ""
        result.append([label, row["total"], row["yes"] or "", yes_pct, row["no"] or "", no_pct])
    return result


def rows_for_doc_yes_no(rows: Sequence[dict]) -> list[list[object]]:
    result = []
    for row in rows:
        label = f"{'    ' * row.get('level', 0)}{row['label']}"
        result.append([label, row["total"], f"{row['yes']} ({percent_text(row['yes'], row['total'])})" if row["total"] else row["yes"], f"{row['no']} ({percent_text(row['no'], row['total'])})" if row["total"] else row["no"]])
    return result


def rows_for_doc_count(rows: Sequence[dict]) -> list[list[object]]:
    return [[str(row["label"]).strip(), row["count"]] for row in rows]


def rows_for_doc_numbered_count(rows: Sequence[dict]) -> list[list[object]]:
    result = []
    index = 1
    for row_index, row in enumerate(rows):
        if row["label"] == "Общий итог":
            result.append(["", row["label"], row["count"]])
            continue
        result.append([index, f"{'    ' * row.get('level', 0)}{row['label']}", row["count"]])
        index += 1
    return result


def list_full_positive(rows: Sequence[dict]) -> str:
    labels = sorted(row["label"] for row in rows if row["label"] != "Общий итог" and row["total"] and row["yes"] == row["total"])
    return ", ".join(labels) if labels else "нет"


def list_full_negative(rows: Sequence[dict]) -> str:
    labels = sorted(row["label"] for row in rows if row["label"] != "Общий итог" and row["total"] and row["no"] == row["total"])
    return ", ".join(labels) if labels else "нет"


def build_class_position_text(row: dict, *, rank_text: str, ending: str = ".") -> str:
    grade = row["label"]
    total = row["total"]
    yes = row["yes"]
    no = row["no"]
    return (
        f"{rank_text} {grade} класс – {total} человек, "
        f"из которых {yes} человека ({percent_text(yes, total)}) показали достаточный уровень владения русским языком, "
        f"{no} человека ({percent_text(no, total)}) – недостаточный уровень владения русским языком{ending}"
    )


def build_class_positions_text(class_rows: Sequence[dict]) -> str:
    grade_rows = [row for row in class_rows if str(row.get("label")) != "Общий итог"]
    if not grade_rows:
        return ""
    ranked = sorted(grade_rows, key=lambda row: (-row["total"], int(str(row["label"]))))
    top_row = ranked[0]
    second_row = ranked[1] if len(ranked) > 1 else ranked[0]
    last_row = ranked[-1]
    return (
        build_class_position_text(top_row, rank_text="Больше всего участников тестирования было среди поступающих в", ending=" (табл. 2).")
        + " "
        + build_class_position_text(second_row, rank_text="На второй позиции – поступающие в", ending=".")
        + " "
        + build_class_position_text(last_row, rank_text="Меньше всего участников тестирования, поступающих в", ending=".")
    )


def build_single_positive_countries_sentence(rows: Sequence[dict]) -> str:
    one_person_rows = [
        row
        for row in rows
        if row["label"] != "Общий итог" and row["total"] == 1
    ]
    if not one_person_rows:
        return ""
    countries = join_human([country_genitive(row["label"]) for row in one_person_rows])
    if not all(row["yes"] == 1 for row in one_person_rows):
        return f" По одному участнику тестирования было из {countries}."
    return f" По одному участнику тестирования было из {countries}, все они показали достаточный уровень владения русским языком."


def build_mo_country_leader_rows(rows: Sequence[dict]) -> dict[str, list[dict]]:
    grouped: dict[str, list[dict]] = {}
    current_mo = ""
    for row in rows:
        if row.get("label") == "Общий итог":
            continue
        level = row.get("level", 0)
        if level == 0:
            current_mo = row["label"]
            grouped[current_mo] = []
        elif level == 1 and current_mo:
            grouped[current_mo].append(row)
    return grouped


def build_leaders_text(rows: Sequence[dict]) -> str:
    target_mos = ["г. Тобольск", "г. Тюмень", "г. Ишим", "Тюменский МО"]
    grouped = build_mo_country_leader_rows(rows)
    parts: list[str] = []
    for mo in target_mos:
        country_rows = grouped.get(mo, [])
        if not country_rows:
            continue
        top_countries = country_rows[:4]
        mo_text = mo_prepositional(mo)
        if mo == "г. Тюмень":
            if len(top_countries) >= 4:
                parts.append(
                    f"В {mo_text} по количеству участников тестирования лидируют представители из "
                    f"{country_genitive(top_countries[0]['label'])} и {country_genitive(top_countries[1]['label'])}, "
                    f"на третьей позиции участники тестирования из {country_genitive(top_countries[2]['label'])}, "
                    f"на четвертой – из {country_genitive(top_countries[3]['label'])}."
                )
            elif len(top_countries) >= 2:
                parts.append(
                    f"В {mo_text} по количеству участников тестирования лидируют представители из "
                    f"{country_genitive(top_countries[0]['label'])} и {country_genitive(top_countries[1]['label'])}."
                )
            elif len(top_countries) == 1:
                parts.append(f"В {mo_text} по количеству участников тестирования лидируют представители из {country_genitive(top_countries[0]['label'])}.")
            continue
        if len(top_countries) >= 2:
            parts.append(
                f"В {mo_text} по количеству участников тестирования лидируют представители из "
                f"{country_genitive(top_countries[0]['label'])} и {country_genitive(top_countries[1]['label'])}."
            )
        elif len(top_countries) == 1:
            parts.append(f"В {mo_text} по количеству участников тестирования лидируют представители из {country_genitive(top_countries[0]['label'])}.")
    return " ".join(parts)


def multiplicity_sort_key(value: str) -> tuple[int, str]:
    order = {
        "первый": 1,
        "второй": 2,
        "третий": 3,
        "четвертый": 4,
        "пятый": 5,
        "шестой": 6,
        "седьмой": 7,
        "восьмой": 8,
    }
    return (order.get(value, 999), value)


def multiplicity_attempt_text(value: str) -> str:
    mapping = {
        "первый": "первый раз",
        "второй": "второй раз",
        "третий": "третий раз",
        "четвертый": "четвертый раз",
        "пятый": "пятый раз",
        "шестой": "шестой раз",
        "седьмой": "седьмой раз",
        "восьмой": "восьмой раз",
    }
    return mapping.get(value, f"{value} раз")


def build_upcoming_counts_text(counts: Counter) -> str:
    parts = []
    for multiplicity, count in sorted(counts.items(), key=lambda item: multiplicity_sort_key(item[0])):
        if not count:
            continue
        parts.append(f"{count} человек {'будет' if count == 1 else 'будут'} сдавать {multiplicity_attempt_text(multiplicity)}")
    return ", ".join(parts)


def rows_for_doc_numbered_yes_no(rows: Sequence[dict]) -> list[list[object]]:
    result = []
    index = 1
    for row_index, row in enumerate(rows):
        yes_value = row["yes"] or ""
        no_value = row["no"] or ""
        yes_pct = percent_text(row["yes"], row["total"]) if row["yes"] else ""
        no_pct = percent_text(row["no"], row["total"]) if row["no"] else ""
        if row["label"] == "Общий итог":
            result.append(["", row["label"], row["total"], yes_value, yes_pct, no_value, no_pct])
            continue
        result.append([index, row["label"], row["total"], yes_value, round(row["yes"] / row["total"] * 100) if row["yes"] else "", no_value, round(row["no"] / row["total"] * 100) if row["no"] else ""])
        index += 1
    return result


def rows_for_doc_plain_yes_no(rows: Sequence[dict]) -> list[list[object]]:
    result = []
    for row_index, row in enumerate(rows):
        label = f"{'    ' * row.get('level', 0)}{row['label']}"
        yes_pct = round(row["yes"] / row["total"] * 100) if row["yes"] else ""
        no_pct = round(row["no"] / row["total"] * 100) if row["no"] else ""
        result.append([label, row["total"], row["yes"] or "", yes_pct, row["no"] or "", no_pct])
    return result


def create_doc_report(
    dataset: SourceDataset,
    start_date: date,
    end_date: date,
    output_path: Path,
    upcoming_dataset: SourceDataset | None = None,
) -> Path:
    children = dataset.latest_children_to(end_date)
    children_by_mo = build_flat_summary(children, lambda item: item.mo)
    class_rows = build_class_summary(children)
    citizenship_rows = build_flat_summary(children, lambda item: item.citizenship)
    mo_country_rows = build_hierarchical_summary(children, "mo", "citizenship")
    special_rows = build_special_summary(children)
    repeated_only = dataset.repeated_attempts_to(end_date)
    repeated_mo_rows = build_flat_summary(repeated_only, lambda item: item.mo)
    repeated_mo_country_rows = build_hierarchical_summary(repeated_only, "mo", "citizenship")
    all_attempts = dataset.attempts_to(end_date)
    attempts_rows = build_flat_summary(all_attempts, lambda item: item.mo)
    trajectory_pool = build_trajectory_pool(children)
    waiting_pool = build_waiting_pool(trajectory_pool)
    waiting_rows = build_waiting_by_mo_status(trajectory_pool)
    status_rows = build_status_summary(trajectory_pool)
    next_test_date, upcoming_records = (upcoming_dataset or dataset).upcoming_attempts_after(end_date)
    upcoming_rows = build_upcoming_rows(upcoming_records) if upcoming_records else []

    total_children = len(children)
    passed_children = sum(1 for item in children if item.pass_result == "да")
    failed_total = sum(1 for item in children if item.pass_result == "нет")
    total_attempts = len(all_attempts)
    status_counter = Counter(record.status for record in trajectory_pool)
    citizenship_count = status_counter["получил гражданство рф"] + status_counter["получает гражданство рф"]
    left_count = status_counter["уехал за пределы рф"] + status_counter["уехал за пределы области"]
    ethnos_count = status_counter["готовится к повторному тестированию в этносе"]
    oo_count = status_counter["готовится к повторному тестированию в оо"]
    tutor_count = status_counter["готовится к повторному тестированию с репетитором"]
    prepared_total = ethnos_count + oo_count + tutor_count
    top_mos = top_non_total(children_by_mo, 3)
    top_countries = top_non_total(citizenship_rows, 3)
    top_attempts = top_non_total(attempts_rows, 3)
    top_repeat_countries = [country_genitive(row["label"]) for row in top_non_total(build_flat_summary(repeated_only, lambda item: item.citizenship), 3)]
    class_positions_text = build_class_positions_text(class_rows)
    single_positive_sentence = build_single_positive_countries_sentence(citizenship_rows)
    special_country_list = join_human(
        sorted(
            {
                country_genitive(row["label"])
                for row in special_rows
                if row.get("level") == 1
            }
        )
    )
    waiting_top_mo = next((row["label"] for row in waiting_rows if row.get("level") == 0 and row["label"] != "Общий итог"), "")
    waiting_top_status = next((row["label"] for row in waiting_rows if row.get("level") == 1), "")
    leaders_text = build_leaders_text(mo_country_rows)

    document = Document()
    section = document.sections[0]
    section.top_margin = Cm(2)
    section.bottom_margin = Cm(2)
    section.left_margin = Cm(3)
    section.right_margin = Cm(1.5)

    add_doc_title(document, "Статистико-аналитическая справка\nпо результатам тестирования иностранных граждан и лиц без гражданства на знание русского языка,\nдостаточное для освоения образовательных программ начального общего, основного и среднего общего образования,\nза период с " + format_ru_date(start_date) + " по " + format_ru_date(end_date))
    add_doc_paragraph(document, "1. Общие результаты тестирования", bold=True, align=WD_ALIGN_PARAGRAPH.LEFT, indent_cm=None)
    add_doc_paragraph(document, f"1.1. За период с {format_ru_date(start_date)} по {format_ru_date(end_date)} в тестировании приняло участие {total_children} человек, из которых {passed_children} участников ({percent_text(passed_children, total_children)}) успешно справились с тестированием (показали достаточный уровень владения русским языком) и зачислены в общеобразовательные организации региона; {failed_total} участника ({percent_text(failed_total, total_children)}) показали недостаточный уровень владения русским языком.")
    if len(top_mos) >= 3:
        add_doc_paragraph(document, f"1.2. Тестирование проходило в {len(children_by_mo) - 1} МО (табл. 1). По количеству участников на первом месте {top_mos[0]['label']} – {top_mos[0]['total']} человека (успешно справились с тестированием {top_mos[0]['yes']} человека ({percent_text(top_mos[0]['yes'], top_mos[0]['total'])}); показали недостаточный уровень владения русским языком – {top_mos[0]['no']} участников тестирования ({percent_text(top_mos[0]['no'], top_mos[0]['total'])}), на втором – {top_mos[1]['label']} – {top_mos[1]['total']} человек (успешно справились с тестированием {top_mos[1]['yes']} человек ({percent_text(top_mos[1]['yes'], top_mos[1]['total'])}); показали недостаточный уровень владения русским языком – {top_mos[1]['no']} участник тестирования ({percent_text(top_mos[1]['no'], top_mos[1]['total'])}), на третьем – {top_mos[2]['label']} – {top_mos[2]['total']} участника (успешно справились с тестированием {top_mos[2]['yes']} человек ({percent_text(top_mos[2]['yes'], top_mos[2]['total'])}); показали недостаточный уровень владения русским языком – {top_mos[2]['no']} участников тестирования ({percent_text(top_mos[2]['no'], top_mos[2]['total'])}). В ряде муниципалитетов тестируемые показали 100% положительный результат – {list_full_positive(children_by_mo)}. В ряде муниципалитетов тестируемые показали 100% отрицательный результат – {list_full_negative(children_by_mo)}.")
    add_doc_table(document, ["№ п/п", "Названия строк", "Общий итог", "Положительный результат", "%", "Отрицательный результат", "%"], rows_for_doc_numbered_yes_no(children_by_mo), "Таблица 1.\n\nОбщая статистика в разрезе " + str(len(children_by_mo) - 1) + " МО")
    add_doc_paragraph(document, class_positions_text if class_positions_text else "")
    add_doc_table(document, ["класс", "Общий итог", "Положительный результат", "%", "Отрицательный результат", "%"], rows_for_doc_plain_yes_no(class_rows), "Таблица 2.\nТестирование мигрантов в разрезе классов")
    if len(top_countries) >= 3:
        add_doc_paragraph(document, f"1.3. В тестировании приняли участие представители {len(citizenship_rows) - 1} государств (табл. 3). Лидирующие позиции по количеству участников занимает {top_countries[0]['label']} – {top_countries[0]['total']} человека (из них показали достаточный уровень владения русским языком {top_countries[0]['yes']} ({percent_text(top_countries[0]['yes'], top_countries[0]['total'])});{top_countries[0]['no']} человек ({percent_text(top_countries[0]['no'], top_countries[0]['total'])}) – недостаточный уровень владения русским языком). На втором месте участники из {country_genitive(top_countries[1]['label'])} – {top_countries[1]['total']} человек (из них показали достаточный уровень владения русским языком {top_countries[1]['yes']} участников тестирования ({percent_text(top_countries[1]['yes'], top_countries[1]['total'])}), {top_countries[1]['no']} человек ({percent_text(top_countries[1]['no'], top_countries[1]['total'])}) – недостаточный уровень владения русским языком). На третьем – из {country_genitive(top_countries[2]['label'])} – {top_countries[2]['total']} человека (из них показали достаточный уровень владения русским языком {top_countries[2]['yes']} участника тестирования ({percent_text(top_countries[2]['yes'], top_countries[2]['total'])}), {top_countries[2]['no']} человека ({percent_text(top_countries[2]['no'], top_countries[2]['total'])}) – недостаточный уровень владения русским языком).{single_positive_sentence}")
    add_doc_table(document, ["№ п/п", "Гражданство", "Общий итог", "Положительный результат", "%", "Отрицательный результат", "%"], rows_for_doc_numbered_yes_no(citizenship_rows), "Таблица 3.\nОбщая статистика по гражданству")
    add_doc_paragraph(document, f"Статистика участников тестирования по гражданству представлена в разрезе {len(children_by_mo) - 1} МО в табл. 4. {leaders_text}")
    add_doc_table(document, ["Названия строк", "Общий итог", "Положительный результат", "%", "Отрицательный результат", "%"], rows_for_doc_plain_yes_no(mo_country_rows), "Таблица 4.\nСтатистика по гражданству в разрезе МО", grouped=True)
    add_doc_paragraph(document, f"1.4. Общая статистка по особым категориям (в соответствии с приказом №727 от 8 октября 2025 г. сдающие только устную часть) (табл. 5) В тестировании приняли участие всего {special_rows[-1]['total']} человек из {len({row['label'] for row in special_rows if row.get('level') == 0 and row['label'] != 'Общий итог'})} муниципальных округов, представители {special_country_list}.")
    add_doc_table(document, ["Муниципальный округ /гражданство/класс", "Общий итог", "Положительный результат", "%", "Отрицательный результат", "%"], rows_for_doc_plain_yes_no(special_rows), "Таблица 5.\nОбщая статистка по особым категориям", grouped=True)
    add_doc_paragraph(document, "2. Результаты повторного тестирования", bold=True, align=WD_ALIGN_PARAGRAPH.LEFT, indent_cm=None)
    repeat_total, repeat_yes, repeat_no = aggregate_yes_no(repeated_only)
    repeat_top = top_non_total(repeated_mo_rows, 1)
    if repeat_top:
        add_doc_paragraph(document, f"2.1. Повторное тестирование прошло в {len(repeated_mo_rows) - 1} МО (табл. 6). В нём приняли участие {repeat_total} человека, из которых {repeat_yes} участника ({percent_text(repeat_yes, repeat_total)}) успешно справились с тестированием и зачислены в общеобразовательные организации региона, {repeat_no} человека ({percent_text(repeat_no, repeat_total)}) показали недостаточный уровень владения русским языком. Большее количество участников, сдающих тестирование повторно, было в {mo_prepositional(repeat_top[0]['label'])} – {repeat_top[0]['total']} (из которых {repeat_top[0]['yes']} участника ({percent_text(repeat_top[0]['yes'], repeat_top[0]['total'])}) успешно справился с тестированием, {repeat_top[0]['no']} человек ({percent_text(repeat_top[0]['no'], repeat_top[0]['total'])}) показали недостаточный уровень владения русским языком).")
    add_doc_table(document, ["№ п/п", "Названия строк", "Общий итог", "Положительный результат", "%", "Отрицательный результат", "%"], rows_for_doc_numbered_yes_no(repeated_mo_rows), "Таблица 6.\nОбщая статистика в разрезе " + str(len(repeated_mo_rows) - 1) + " МО")
    add_doc_paragraph(document, f"2.2. Большее количество повторно сдававших было из {', '.join(top_repeat_countries)} (табл. 7).")
    add_doc_table(document, ["Названия строк", "Общий итог", "Положительный результат", "%", "Отрицательный результат", "%"], rows_for_doc_plain_yes_no(repeated_mo_country_rows), "Таблица 7.\nОбщая статистика повторно сдававших по гражданству и МО", grouped=True)
    add_doc_paragraph(document, "3. Общее количество проведенных тестирований", bold=True, align=WD_ALIGN_PARAGRAPH.LEFT, indent_cm=None)
    if len(top_attempts) >= 3:
        add_doc_paragraph(document, f"3. В период с {format_ru_date(start_date)} по {format_ru_date(end_date)} проведено {total_attempts} тестирования (человекотестов), из них {sum(1 for item in all_attempts if item.pass_result == 'да')} – достаточный уровень владения русским языком, {sum(1 for item in all_attempts if item.pass_result == 'нет')} – недостаточный уровень (табл. 8). Большее количество тестирований прошло в {mo_prepositional(top_attempts[0]['label'])} ({top_attempts[0]['total']}), в {mo_prepositional(top_attempts[1]['label'])} ({top_attempts[1]['total']}), {mo_prepositional(top_attempts[2]['label'])} ({top_attempts[2]['total']}).")
    add_doc_table(document, ["№ п/п", "Названия строк", "Общий итог", "Положительный результат", "%", "Отрицательный результат", "%"], rows_for_doc_numbered_yes_no(attempts_rows), "Таблица 8.")
    add_doc_paragraph(document, "4. Дальнейшая траектория участников", bold=True, align=WD_ALIGN_PARAGRAPH.LEFT, indent_cm=None)
    add_doc_paragraph(document, f"4.1. На {format_ru_date(end_date)} по результатам тестирования имеет недостаточный уровень владения русским языком {len(trajectory_pool)} участников (табл. 9), при этом большее количество планируют пересдавать тестирование в {mo_prepositional(waiting_top_mo)}. Лидирующие позиции занимают участники со статусом {waiting_top_status}.")
    add_doc_table(document, ["МО / Статус", "Количество"], rows_for_doc_count(waiting_rows), "Таблица 9. Результаты мониторинга дальнейшей траектории в разрезе МО и статусов", grouped=True, row_levels=[row.get("level", 0) for row in waiting_rows])
    add_doc_paragraph(document, f"Получили/получают гражданство – {citizenship_count} человек, выбыли за пределы региона – {left_count} (табл. 10). Итоговое количество иностранных граждан на отчетную дату, ожидающих тестирование – {len(waiting_pool)} (без учета получивших/получающих гражданство, покинувших пределы области/РФ, поступивших/поступающих в колледж, оставшихся в детском саду). Из ожидающих тестирование: занимаются в «Этносе» – {ethnos_count}, занимаются в ОО – {oo_count}, занимаются с репетитором – {tutor_count}, итого – {prepared_total} человек.")
    add_doc_table(document, ["№ п/п", "Статус", "Количество"], rows_for_doc_numbered_count(status_rows), "Таблица 10. Результаты мониторинга дальнейшей траектории по статусам")
    add_doc_paragraph(document, "5. Заявка на следующее тестирование", bold=True, align=WD_ALIGN_PARAGRAPH.LEFT, indent_cm=None)
    if next_test_date and upcoming_records:
        counts = Counter(record.multiplicity for record in upcoming_records)
        add_doc_paragraph(document, f"Статистика по количеству участников на {format_ru_date(next_test_date)}, в том числе заявившихся на повторное тестирование, у которых истек срок 3 месяца с последней даты тестирования (табл. 11). Всего заявилось {len(upcoming_records)} человек, из них {build_upcoming_counts_text(counts)}.")
        add_doc_upcoming_table(document, upcoming_rows, f"Таблица 11.\nСдающие {next_test_date.strftime('%d')} {['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'][next_test_date.month-1]} в разрезе МО, гражданства, кратности тестирования")
    else:
        add_doc_paragraph(document, "5.1. В исходном файле не найдено заявок на следующую дату тестирования.")
    document.save(output_path)
    return output_path


