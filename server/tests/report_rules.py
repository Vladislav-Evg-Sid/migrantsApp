import sys
import unittest
from dataclasses import replace
from datetime import date
from pathlib import Path
from tempfile import TemporaryDirectory

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "reports"))
from generate import from_db, summary_workbook
from migrant_reports.data_loader import SourceDataset
from migrant_reports.models import MULTIPLICITY_ORDER
from migrant_reports.calculations import build_repeat_by_date
from migrant_reports.excel_builder import build_statistics_workbook
from migrant_reports.word_builder import create_doc_report


class ReportRules(unittest.TestCase):
    def setUp(self):
        self.record = from_db(dict(
            exam_id="1", participant_id="7200010101", area="Тест",surname="Тест",name="Тест",patronymic=None,
            birth_date="2015-01-01",citizenship="Кыргызстан",multiplicity="третий",attempt=3,
            school_code=1,school_name="Школа",grade=1,ppt_code=1,special=False,test_date="2026-01-01",
            result="Зачет",status="Сдал",next_planned_date=None,confirmed_school_name="Школа после гражданства",
            comment="=1+1",rcoi_note=None,ppt_name="ППТ",appeal_date=None,appeal_granted=None,appeal_present=None,
        ),1)

    def test_period_and_no_shows(self):
        rows = [self.record,
                replace(self.record,test_date=date(2026,1,2),pass_result="неявка"),
                replace(self.record,test_date=date(2026,1,3),pass_result=None),
                replace(self.record,test_date=date(2026,1,4),pass_result="нет",internal_id="2")]
        source = SourceDataset(Path("db"),rows)
        period = source.filtered_by_period(date(2026,1,2),date(2026,1,4),recalculate_multiplicity=True)
        self.assertEqual(len(period.records),1)
        self.assertEqual(period.records[0].multiplicity,"первый")
        self.assertEqual(source.records[0].multiplicity,"третий")
        self.assertEqual(source.latest_children_to(date(2026,1,3))[0].pass_result,"да")
        self.assertEqual(source.upcoming_attempts_after(date(2026,1,1))[0],date(2026,1,2))

    def test_same_day_tie_and_later_attempts(self):
        rows = [replace(self.record,internal_id=str(i).zfill(20)) for i in reversed(range(1,23))]
        recalculated = SourceDataset._recalculate_multiplicity(rows)
        self.assertEqual(recalculated[0].internal_id,str(1).zfill(20))
        self.assertEqual(recalculated[8].multiplicity,"девятый")
        self.assertEqual(recalculated[-1].multiplicity,"22-й")
        summary = build_repeat_by_date(recalculated,date(2026,1,1))[-1]
        self.assertEqual(summary["total"],21)
        self.assertEqual(summary["multiplicities"]["22-й"]["yes"],1)

    def test_literal_excel_text(self):
        import io
        import openpyxl
        w = openpyxl.load_workbook(io.BytesIO(summary_workbook([self.record])),data_only=False)
        self.assertEqual(w.active.cell(2,20).value,"=1+1")
        self.assertEqual(w.active.cell(2,20).data_type,"s")
        self.assertEqual(w.active.cell(2,19).value,"Школа после гражданства")
        w.close()

    def test_repeat_exports_include_each_completed_attempt(self):
        import openpyxl
        from docx import Document

        start, end = date(2026, 3, 24), date(2026, 11, 9)
        rows = [
            replace(self.record, test_date=date(2026, 3, 23), multiplicity="первый"),
            replace(self.record, test_date=start, multiplicity="второй", pass_result="нет"),
            replace(self.record, test_date=date(2026, 6, 26), multiplicity="третий", pass_result="нет"),
            replace(self.record, test_date=end, multiplicity="четвертый", pass_result="да"),
            replace(self.record, test_date=end, multiplicity="пятый", pass_result="неявка"),
            replace(self.record, test_date=end, multiplicity="шестой", pass_result=None),
            replace(self.record, test_date=date(2026, 11, 10), multiplicity="седьмой"),
        ]
        source = SourceDataset(Path("db"), rows)
        with TemporaryDirectory() as directory:
            for recalculate, expected in [(False, (3, 1, 2)), (True, (2, 1, 1))]:
                with self.subTest(recalculate=recalculate):
                    dataset = source.filtered_by_period(start, end, recalculate_multiplicity=recalculate)
                    doc_path, excel_path = Path(directory) / "report.docx", Path(directory) / "statistics.xlsx"
                    create_doc_report(dataset, start, end, doc_path)
                    build_statistics_workbook(dataset, [end], excel_path)
                    document = Document(doc_path)
                    for table_index, offset in [(5, 2), (6, 1)]:
                        total = next([cell.text for cell in row.cells] for row in document.tables[table_index].rows[1:]
                                     if any(cell.text == "Общий итог" for cell in row.cells))
                        self.assertEqual(tuple(int(total[offset + i]) for i in (0, 1, 3)), expected)
                    workbook = openpyxl.load_workbook(excel_path, data_only=True)
                    total = next(row for row in workbook["повторно_весь период чел тест"].values if row[1] == "Общий итог")
                    self.assertEqual(tuple(int(total[i] or 0) for i in (2, 3, 5)), expected)
                    workbook.close()
                    self.assertEqual(len(dataset.latest_children_to(end)), 1)
                    self.assertEqual(dataset.latest_children_to(end)[0].pass_result, "да")
                    self.assertTrue(any(f"Проведено {expected[0]} повторных тестирований у 1 участников" in p.text
                                        for p in document.paragraphs))


if __name__ == "__main__":
    unittest.main()
