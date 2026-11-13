"""Build the currently filtered participants table as an Excel workbook."""
import io
import json
import sys

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter


def main():
    payload = json.load(sys.stdin)
    headers = payload["headers"]
    rows = payload["rows"]
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Участники"
    sheet.append(headers)
    for cell in sheet[1]:
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor="5B9BD5")
        cell.alignment = Alignment(wrap_text=True, vertical="center")
    sheet.row_dimensions[1].height = 45
    widths = [0] * len(headers)
    for values in rows:
        values = ["да" if value is True else "нет" if value is False else value for value in values]
        for index, value in enumerate(values):
            if value is not None:
                widths[index] = max(widths[index], *(len(line) for line in str(value).splitlines()))
        sheet.append(values)
        for cell in sheet[sheet.max_row]:
            if isinstance(cell.value, str):
                cell.data_type = "s"
    for index, width in enumerate(widths, 1):
        sheet.column_dimensions[get_column_letter(index)].width = max(3, width + 2)
    sheet.freeze_panes = "A2"
    sheet.auto_filter.ref = sheet.dimensions
    output = io.BytesIO()
    workbook.save(output)
    sys.stdout.buffer.write(output.getvalue())


if __name__ == "__main__":
    main()
