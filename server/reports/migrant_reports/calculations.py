from __future__ import annotations

from collections import Counter, defaultdict
from datetime import date
from typing import Callable, Iterable, Sequence

from .data_loader import SourceDataset
from .models import EXCLUDED_WAITING_STATUSES, MULTIPLICITY_ORDER, PersonRecord, count_with_percent, format_ru_date, percent_text, status_label

def sort_mos(values: Iterable[str]) -> list[str]:
    return sorted({value for value in values if value}, key=lambda item: (item.lower() != "общий итог", item))


def sort_countries(values: Iterable[str]) -> list[str]:
    return sorted({value for value in values if value})


def sort_grades(values: Iterable[int | None]) -> list[int]:
    return sorted({value for value in values if value is not None})


def sort_labels_by_group_size(groups: dict[str, Sequence[PersonRecord]]) -> list[str]:
    return sorted(groups.keys(), key=lambda label: (-len(groups[label]), label))


def sort_labels_by_nested_size(groups: dict[str, dict[str, Sequence[PersonRecord]]]) -> list[str]:
    return sorted(
        groups.keys(),
        key=lambda label: (-sum(len(items) for items in groups[label].values()), label),
    )


def sort_count_rows(rows: list[dict]) -> list[dict]:
    body = [row for row in rows if row.get("label") != "Общий итог"]
    total_row = next((row for row in rows if row.get("label") == "Общий итог"), None)
    body.sort(key=lambda row: (-row.get("count", 0), row.get("label", "")))
    return body + ([total_row] if total_row else [])


def aggregate_yes_no(records: Iterable[PersonRecord]) -> tuple[int, int, int]:
    total = 0
    passed = 0
    failed = 0
    for record in records:
        if record.pass_result not in {"да", "нет"}:
            continue
        total += 1
        if record.pass_result == "да":
            passed += 1
        else:
            failed += 1
    return total, passed, failed


def build_flat_summary(records: Sequence[PersonRecord], key_func: Callable[[PersonRecord], str]) -> list[dict]:
    rows = []
    groups: dict[str, list[PersonRecord]] = defaultdict(list)
    for record in records:
        groups[key_func(record)].append(record)
    for key in sort_labels_by_group_size(groups):
        total, passed, failed = aggregate_yes_no(groups[key])
        rows.append({"label": key, "total": total, "yes": passed, "no": failed})
    total, passed, failed = aggregate_yes_no(records)
    rows.append({"label": "Общий итог", "total": total, "yes": passed, "no": failed})
    return rows


def build_flat_summary_with_order(records: Sequence[PersonRecord], labels: Sequence[str], key_func: Callable[[PersonRecord], str]) -> list[dict]:
    groups: dict[str, list[PersonRecord]] = defaultdict(list)
    for record in records:
        groups[key_func(record)].append(record)
    rows = []
    for label in labels:
        total, passed, failed = aggregate_yes_no(groups.get(label, []))
        rows.append({"label": label, "total": total, "yes": passed, "no": failed})
    total, passed, failed = aggregate_yes_no(records)
    rows.append({"label": "Общий итог", "total": total, "yes": passed, "no": failed})
    return rows


def build_hierarchical_summary(records: Sequence[PersonRecord], first: str, second: str) -> list[dict]:
    rows: list[dict] = []
    grouped: dict[str, dict[str, list[PersonRecord]]] = defaultdict(lambda: defaultdict(list))
    for record in records:
        grouped[getattr(record, first)][getattr(record, second)].append(record)
    for outer_key in sort_labels_by_nested_size(grouped):
        outer_records = [record for inner in grouped[outer_key].values() for record in inner]
        total, passed, failed = aggregate_yes_no(outer_records)
        rows.append({"label": outer_key, "level": 0, "total": total, "yes": passed, "no": failed})
        for inner_key in sort_labels_by_group_size(grouped[outer_key]):
            total, passed, failed = aggregate_yes_no(grouped[outer_key][inner_key])
            rows.append({"label": inner_key, "level": 1, "total": total, "yes": passed, "no": failed})
    total, passed, failed = aggregate_yes_no(records)
    rows.append({"label": "Общий итог", "level": 0, "total": total, "yes": passed, "no": failed})
    return rows


def _build_grade_row(label: str, records: Sequence[PersonRecord], grades: Sequence[int], level: int) -> dict:
    row = {
        "label": label,
        "level": level,
        "total": len(records),
        "yes": sum(1 for item in records if item.pass_result == "да"),
        "no": sum(1 for item in records if item.pass_result == "нет"),
        "grades": {},
    }
    for grade in grades:
        subset = [item for item in records if item.grade == grade]
        row["grades"][grade] = {
            "yes": sum(1 for item in subset if item.pass_result == "да"),
            "no": sum(1 for item in subset if item.pass_result == "нет"),
        }
    return row


def build_daily_mo_grade(records: Sequence[PersonRecord]) -> tuple[list[int], list[dict]]:
    grades = sort_grades(record.grade for record in records)
    by_mo: dict[str, list[PersonRecord]] = defaultdict(list)
    for record in records:
        by_mo[record.mo].append(record)
    rows = [_build_grade_row(mo, by_mo[mo], grades, 0) for mo in sort_labels_by_group_size(by_mo)]
    rows.append(_build_grade_row("Общий итог", list(records), grades, 0))
    return grades, rows


def build_daily_mo_country_grade(records: Sequence[PersonRecord]) -> tuple[list[int], list[dict]]:
    grades = sort_grades(record.grade for record in records)
    grouped: dict[str, dict[str, list[PersonRecord]]] = defaultdict(lambda: defaultdict(list))
    for record in records:
        grouped[record.mo][record.citizenship].append(record)
    rows: list[dict] = []
    for mo in sort_labels_by_nested_size(grouped):
        mo_records = [record for country_records in grouped[mo].values() for record in country_records]
        rows.append(_build_grade_row(mo, mo_records, grades, 0))
        for country in sort_labels_by_group_size(grouped[mo]):
            rows.append(_build_grade_row(country, grouped[mo][country], grades, 1))
    rows.append(_build_grade_row("Общий итог", list(records), grades, 0))
    return grades, rows


def build_special_summary(records: Sequence[PersonRecord]) -> list[dict]:
    special_records = [record for record in records if record.special_category == "да"]
    rows: list[dict] = []
    grouped: dict[str, dict[str, dict[int, list[PersonRecord]]]] = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))
    for record in special_records:
        if record.grade is not None:
            grouped[record.mo][record.citizenship][record.grade].append(record)
    mo_order = sorted(
        grouped.keys(),
        key=lambda mo: (
            -sum(len(record) for country_groups in grouped[mo].values() for record in country_groups.values()),
            mo,
        ),
    )
    for mo in mo_order:
        mo_records = [record for country_groups in grouped[mo].values() for grade_group in country_groups.values() for record in grade_group]
        total, passed, failed = aggregate_yes_no(mo_records)
        rows.append({"label": mo, "level": 0, "total": total, "yes": passed, "no": failed})
        country_order = sorted(
            grouped[mo].keys(),
            key=lambda country: (-sum(len(items) for items in grouped[mo][country].values()), country),
        )
        for country in country_order:
            country_records = [record for grade_group in grouped[mo][country].values() for record in grade_group]
            total, passed, failed = aggregate_yes_no(country_records)
            rows.append({"label": country, "level": 1, "total": total, "yes": passed, "no": failed})
            for grade in sort_grades(grouped[mo][country].keys()):
                total, passed, failed = aggregate_yes_no(grouped[mo][country][grade])
                rows.append({"label": f"{grade} класс", "level": 2, "total": total, "yes": passed, "no": failed})
    total, passed, failed = aggregate_yes_no(special_records)
    rows.append({"label": "Общий итог", "level": 0, "total": total, "yes": passed, "no": failed})
    return rows


def build_repeat_by_date(records: Sequence[PersonRecord], control_date: date) -> list[dict]:
    filtered = [record for record in records if record.test_date <= control_date and record.multiplicity != "первый" and record.pass_result in {"да", "нет"}]
    grouped: dict[date, dict[str, list[PersonRecord]]] = defaultdict(lambda: defaultdict(list))
    for record in filtered:
        grouped[record.test_date][record.mo].append(record)
    rows = []
    for test_date in sorted(grouped):
        day_records = [record for items in grouped[test_date].values() for record in items]
        rows.append(_repeat_mix_row(test_date, day_records, is_date=True))
        for mo in sort_mos(grouped[test_date].keys()):
            rows.append(_repeat_mix_row(mo, grouped[test_date][mo], is_date=False))
    rows.append(_repeat_mix_row("Общий итог", filtered, is_date=False))
    return rows


def _repeat_mix_row(label: date | str, records: Sequence[PersonRecord], *, is_date: bool) -> dict:
    multiplicities = {}
    total = 0
    for multiplicity in MULTIPLICITY_ORDER[1:]:
        subset = [record for record in records if record.multiplicity == multiplicity]
        yes_count = sum(1 for record in subset if record.pass_result == "да")
        no_count = sum(1 for record in subset if record.pass_result == "нет")
        multiplicities[multiplicity] = {"yes": yes_count, "no": no_count, "total": yes_count + no_count}
        total += yes_count + no_count
    return {"label": label, "is_date": is_date, "total": total, "multiplicities": multiplicities}


def build_repeated_whole_period(records: Sequence[PersonRecord], control_date: date) -> tuple[list[int], list[dict]]:
    repeated_records = [record for record in records if record.test_date <= control_date and record.multiplicity != "первый" and record.pass_result in {"да", "нет"}]
    grades = sort_grades(record.grade for record in repeated_records)
    grouped: dict[date, dict[str, list[PersonRecord]]] = defaultdict(lambda: defaultdict(list))
    for record in repeated_records:
        grouped[record.test_date][record.mo].append(record)
    rows = []
    for test_date in sorted(grouped):
        day_records = [record for items in grouped[test_date].values() for record in items]
        rows.append(_repeat_period_row(test_date, day_records, grades, is_date=True))
        for mo in sort_mos(grouped[test_date].keys()):
            rows.append(_repeat_period_row(mo, grouped[test_date][mo], grades, is_date=False))
    rows.append(_repeat_period_row("Общий итог", repeated_records, grades, is_date=False))
    return grades, rows


def _repeat_period_row(label: date | str, records: Sequence[PersonRecord], grades: Sequence[int], *, is_date: bool) -> dict:
    total, passed, failed = aggregate_yes_no(records)
    grade_values = {}
    for grade in grades:
        subset = [record for record in records if record.grade == grade]
        grade_values[grade] = {"yes": sum(1 for record in subset if record.pass_result == "да"), "no": sum(1 for record in subset if record.pass_result == "нет")}
    return {"label": label, "is_date": is_date, "total": total, "yes": passed, "no": failed, "grades": grade_values}


def build_class_summary(records: Sequence[PersonRecord]) -> list[dict]:
    rows = []
    for grade in sort_grades(record.grade for record in records):
        subset = [record for record in records if record.grade == grade]
        total, passed, failed = aggregate_yes_no(subset)
        rows.append({"label": str(grade), "total": total, "yes": passed, "no": failed})
    total, passed, failed = aggregate_yes_no(records)
    rows.append({"label": "Общий итог", "total": total, "yes": passed, "no": failed})
    return rows


def build_status_summary(records: Sequence[PersonRecord]) -> list[dict]:
    counter = Counter(record.status for record in records)
    rows = [{"label": status_label(status), "count": count, "raw_status": status} for status, count in counter.most_common()]
    rows.append({"label": "Общий итог", "count": sum(counter.values()), "raw_status": "overall"})
    return sort_count_rows(rows)


def build_waiting_pool(records: Sequence[PersonRecord]) -> list[PersonRecord]:
    return [record for record in records if record.status not in EXCLUDED_WAITING_STATUSES]


def build_trajectory_pool(records: Sequence[PersonRecord]) -> list[PersonRecord]:
    return [record for record in records if record.status != "сдал"]


def build_waiting_by_mo_country(records: Sequence[PersonRecord]) -> list[dict]:
    rows: list[dict] = []
    grouped: dict[str, dict[str, list[PersonRecord]]] = defaultdict(lambda: defaultdict(list))
    for record in records:
        grouped[record.mo][record.citizenship].append(record)
    for mo in sort_labels_by_nested_size(grouped):
        rows.append({"label": mo, "level": 0, "count": sum(len(country_records) for country_records in grouped[mo].values())})
        for country in sort_labels_by_group_size(grouped[mo]):
            rows.append({"label": country, "level": 1, "count": len(grouped[mo][country])})
    rows.append({"label": "Общий итог", "level": 0, "count": len(records)})
    return rows


def build_waiting_by_mo_status(records: Sequence[PersonRecord]) -> list[dict]:
    rows: list[dict] = []
    grouped: dict[str, dict[str, list[PersonRecord]]] = defaultdict(lambda: defaultdict(list))
    for record in records:
        grouped[record.mo][status_label(record.status)].append(record)
    for mo in sort_labels_by_nested_size(grouped):
        rows.append({"label": mo, "level": 0, "count": sum(len(status_records) for status_records in grouped[mo].values())})
        for status in sorted(grouped[mo].keys(), key=lambda label: (-len(grouped[mo][label]), label)):
            rows.append({"label": status, "level": 1, "count": len(grouped[mo][status])})
    rows.append({"label": "Общий итог", "level": 0, "count": len(records)})
    return rows


def grades_text(records: Sequence[PersonRecord]) -> str:
    counts = Counter(record.grade for record in records if record.grade is not None)
    return "; ".join(f"{grade} кл. - {counts[grade]}" for grade in sorted(counts))


def grade_counts(records: Sequence[PersonRecord]) -> dict[int, int]:
    counts = Counter(record.grade for record in records if record.grade is not None)
    return {grade: counts[grade] for grade in sorted(counts)}


def build_upcoming_rows(records: Sequence[PersonRecord]) -> list[dict]:
    grouped: dict[str, dict[str, dict[str, list[PersonRecord]]]] = defaultdict(lambda: defaultdict(lambda: defaultdict(list)))
    for record in records:
        grouped[record.mo][record.citizenship][record.multiplicity].append(record)
    rows = []
    for mo in sorted(
        grouped.keys(),
        key=lambda value: (
            -sum(len(record) for country_groups in grouped[value].values() for record in country_groups.values()),
            value,
        ),
    ):
        mo_records = [record for country_groups in grouped[mo].values() for records_list in country_groups.values() for record in records_list]
        rows.append({"label": mo, "level": 0, "count": len(mo_records), "grades": grades_text(mo_records), "grade_counts": grade_counts(mo_records)})
        for country in sorted(
            grouped[mo].keys(),
            key=lambda value: (-sum(len(items) for items in grouped[mo][value].values()), value),
        ):
            country_records = [record for records_list in grouped[mo][country].values() for record in records_list]
            rows.append({"label": country, "level": 1, "count": len(country_records), "grades": grades_text(country_records), "grade_counts": grade_counts(country_records)})
            for multiplicity in MULTIPLICITY_ORDER:
                subset = grouped[mo][country].get(multiplicity, [])
                if subset:
                    rows.append({"label": multiplicity.capitalize(), "level": 2, "count": len(subset), "grades": grades_text(subset), "grade_counts": grade_counts(subset)})
    rows.append({"label": "Общий итог", "level": 0, "count": len(records), "grades": grades_text(records), "grade_counts": grade_counts(records)})
    return rows
