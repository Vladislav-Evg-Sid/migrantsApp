import sys
import unittest
from dataclasses import replace
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "reports"))
from generate import from_db, summary_workbook
from migrant_reports.data_loader import SourceDataset
from migrant_reports.models import MULTIPLICITY_ORDER
from migrant_reports.calculations import build_repeat_by_date


class ReportRules(unittest.TestCase):
    def setUp(self):
        self.record = from_db(dict(
            exam_id="1", participant_id="7200010101", area="Тест",surname="Тест",name="Тест",patronymic=None,
            birth_date="2015-01-01",citizenship="Кыргызстан",multiplicity="третий",attempt=3,
            school_code=1,school_name="Школа",grade=1,ppt_code=1,special=False,test_date="2026-01-01",
            result="Зачет",status="Сдал",next_planned_date=None,confirmed_school_code=None,
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
        w.close()


if __name__ == "__main__":
    unittest.main()
