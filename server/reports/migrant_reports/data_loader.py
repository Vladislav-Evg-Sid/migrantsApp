from __future__ import annotations

from dataclasses import replace
from datetime import date
from pathlib import Path

import openpyxl

from .models import MULTIPLICITY_ORDER, PersonRecord, normalize_country, normalize_date, normalize_multiplicity, normalize_result, normalize_special, normalize_status, normalize_text, safe_int

class SourceDataset:
    def __init__(self, file_path: Path, records: list[PersonRecord] | None = None) -> None:
        self.file_path = file_path
        self.records = records if records is not None else self._load_records(file_path)
        if not self.records:
            raise ValueError("В первом листе исходного файла не найдено записей.")
        self.min_test_date = min(record.test_date for record in self.records)
        self.max_test_date = max(record.test_date for record in self.records)

    @staticmethod
    def _load_records(file_path: Path) -> list[PersonRecord]:
        workbook = openpyxl.load_workbook(file_path, data_only=True, read_only=True)
        sheet = workbook[workbook.sheetnames[0]]
        records: list[PersonRecord] = []
        for row in sheet.iter_rows(min_row=2, values_only=True):
            source_row = tuple(row)
            values = list(source_row) + [None] * max(0, 23 - len(source_row))
            test_date = normalize_date(values[14])
            uid = normalize_text(values[2])
            if not uid or not test_date:
                continue
            records.append(
                PersonRecord(
                    uid=uid,
                    internal_id=normalize_text(values[1]),
                    mo=normalize_text(values[3]),
                    last_name=normalize_text(values[4]),
                    first_name=normalize_text(values[5]),
                    middle_name=normalize_text(values[6]),
                    birth_date=normalize_date(values[7]),
                    citizenship=normalize_country(values[8]),
                    multiplicity=normalize_multiplicity(values[9]),
                    school_code=normalize_text(values[10]),
                    grade=safe_int(values[11]),
                    test_point_code=normalize_text(values[12]),
                    special_category=normalize_special(values[13]),
                    test_date=test_date,
                    pass_result=normalize_result(values[15]),
                    status=normalize_status(values[16]),
                    retest_date=normalize_date(values[17]),
                    school_after_citizenship=normalize_text(values[18]),
                    comment=normalize_text(values[19]),
                    rc_comment=normalize_text(values[20]),
                    test_point_name=normalize_text(values[21]),
                    appeal=normalize_text(values[22]),
                    source_row=source_row,
                )
            )
        workbook.close()
        return records

    def filtered_by_period(self, start_date: date, end_date: date, *, recalculate_multiplicity: bool = False) -> "SourceDataset":
        records = [record for record in self.records if start_date <= record.test_date <= end_date]
        if recalculate_multiplicity:
            records = [record for record in records if record.pass_result in {"да", "нет"}]
            records = self._recalculate_multiplicity(records)
        return SourceDataset(self.file_path, records)

    @staticmethod
    def _recalculate_multiplicity(records: list[PersonRecord]) -> list[PersonRecord]:
        grouped: dict[str, list[PersonRecord]] = {}
        for record in records:
            grouped.setdefault(record.uid, []).append(record)

        recalculated: list[PersonRecord] = []
        for person_records in grouped.values():
            ordered = sorted(person_records, key=lambda item: (item.test_date, item.uid, item.internal_id))
            for index, record in enumerate(ordered):
                if index >= len(MULTIPLICITY_ORDER):
                    MULTIPLICITY_ORDER.append(f"{index + 1}-й")
                multiplicity = MULTIPLICITY_ORDER[index]
                recalculated.append(replace(record, multiplicity=multiplicity))
        return sorted(recalculated, key=lambda item: (item.test_date, item.mo, item.uid, item.internal_id))

    def test_dates(self) -> list[date]:
        return sorted({record.test_date for record in self.records})

    def attempts_to(self, control_date: date, *, include_no_show: bool = False) -> list[PersonRecord]:
        records = [record for record in self.records if record.test_date <= control_date]
        if not include_no_show:
            records = [record for record in records if record.pass_result in {"да", "нет"}]
        return sorted(records, key=lambda item: (item.test_date, item.uid, item.internal_id))

    def attempts_on(self, control_date: date, *, include_no_show: bool = False) -> list[PersonRecord]:
        records = [record for record in self.records if record.test_date == control_date]
        if not include_no_show:
            records = [record for record in records if record.pass_result in {"да", "нет"}]
        return sorted(records, key=lambda item: (item.mo, item.grade or 0, item.uid))

    def latest_children_to(self, control_date: date) -> list[PersonRecord]:
        latest: dict[str, PersonRecord] = {}
        for record in self.attempts_to(control_date, include_no_show=False):
            latest[record.uid] = record
        return sorted(latest.values(), key=lambda item: (item.mo, item.citizenship, item.grade or 0, item.uid))

    def failed_children_to(self, control_date: date) -> list[PersonRecord]:
        return [record for record in self.latest_children_to(control_date) if record.pass_result == "нет"]

    def repeated_attempts_to(self, control_date: date) -> list[PersonRecord]:
        latest_by_statistical_id: dict[str, PersonRecord] = {}
        for record in self.attempts_to(control_date, include_no_show=False):
            latest_by_statistical_id[record.uid] = record
        return sorted(
            [record for record in latest_by_statistical_id.values() if record.multiplicity != "первый"],
            key=lambda item: (item.mo, item.citizenship, item.uid),
        )

    def all_repeat_attempts_to(self, control_date: date) -> list[PersonRecord]:
        return [record for record in self.attempts_to(control_date) if record.multiplicity != "первый"]

    def upcoming_attempts_after(self, control_date: date) -> tuple[date | None, list[PersonRecord]]:
        future_dates = sorted({record.test_date for record in self.records if record.test_date > control_date})
        if not future_dates:
            return None, []
        next_date = future_dates[0]
        return next_date, self.attempts_on(next_date, include_no_show=True)


def export_filtered_source_workbook(dataset: SourceDataset, output_path: Path) -> Path:
    workbook = openpyxl.load_workbook(dataset.file_path)
    sheet = workbook[workbook.sheetnames[0]]
    if sheet.max_row > 1:
        sheet.delete_rows(2, sheet.max_row - 1)

    for record in dataset.records:
        values = list(record.source_row)
        if len(values) < 15:
            values.extend([""] * (15 - len(values)))
        values[7] = record.birth_date
        values[9] = record.multiplicity
        values[14] = record.test_date
        sheet.append(values)
        row_index = sheet.max_row
        for column_index in (8, 15):
            cell = sheet.cell(row_index, column_index)
            if cell.value:
                cell.number_format = "DD.MM.YYYY"

    for column_letter in ("H", "O"):
        sheet.column_dimensions[column_letter].width = max(
            sheet.column_dimensions[column_letter].width or 0,
            14,
        )

    workbook.save(output_path)
    return output_path
