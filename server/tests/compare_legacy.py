"""Optional regression check: python tests/compare_legacy.py <legacy package> <check output>."""
import json
import sys
import tempfile
import types
from datetime import date
from pathlib import Path

import openpyxl
from docx import Document

legacy = Path(sys.argv[1]).resolve()
directory = Path(sys.argv[2]).resolve()
# Import only the original calculation/building modules, without the desktop GUI.
package = types.ModuleType("migrant_reports")
package.__path__ = [str(legacy)]
sys.modules["migrant_reports"] = package
from migrant_reports.data_loader import SourceDataset
from migrant_reports.excel_builder import build_statistics_workbook
from migrant_reports.word_builder import create_doc_report

source = SourceDataset(directory / "all-summary.xlsx")
comparisons = 0
with tempfile.TemporaryDirectory(dir=directory) as temporary:
    for case in json.loads((directory / "expected.json").read_text(encoding="utf-8")):
        options = case["options"]
        start, end = date.fromisoformat(options["startDate"]), date.fromisoformat(options["endDate"])
        dataset = source.filtered_by_period(start,end,recalculate_multiplicity=options["recalculate"])
        doc_path = Path(temporary) / "legacy.docx"
        xlsx_path = Path(temporary) / "legacy.xlsx"
        create_doc_report(dataset,start,end,doc_path,upcoming_dataset=source)
        build_statistics_workbook(dataset,[date.fromisoformat(value) for value in options["dates"]],xlsx_path)
        old, new = Document(doc_path), Document(directory / f"{case['label']}-analytical.docx")
        assert [p.text for p in old.paragraphs] == [p.text for p in new.paragraphs], case["label"]
        assert [[[c.text for c in r.cells] for r in t.rows] for t in old.tables] == [[[c.text for c in r.cells] for r in t.rows] for t in new.tables], case["label"]
        old_w = openpyxl.load_workbook(xlsx_path,data_only=True)
        new_w = openpyxl.load_workbook(directory / f"{case['label']}-statistics.xlsx",data_only=True)
        assert len(old_w.worksheets) == len(new_w.worksheets)
        for old_sheet,new_sheet in zip(old_w.worksheets,new_w.worksheets):
            assert list(old_sheet.values) == list(new_sheet.values), (case["label"],new_sheet.title)
            comparisons += 1
        old_w.close()
        new_w.close()
        comparisons += 2
print(f"Legacy regression passed: {comparisons} paragraph/table/sheet comparisons")
