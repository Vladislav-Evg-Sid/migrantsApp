from __future__ import annotations

from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side

HEADER_FILL = PatternFill(patternType="solid", fgColor="FF5B9BD5", bgColor="FF5B9BD5")
GROUP_FILL = PatternFill()
GREEN_FILL = PatternFill("solid", fgColor="FF92D050")
PASS_FILL = PatternFill(patternType="solid", fgColor="FFF4B183", bgColor="FFF4B183")
FAIL_FILL = PatternFill(patternType="solid", fgColor="FFFFC7CE", bgColor="FFFFC7CE")
HEADER_FONT = Font(name="Calibri", bold=True, color="FFFFFFFF")
REGULAR_FONT = Font(name="Calibri", bold=False)
WORD_HEADER_DARK_FILL = "5B9BD5"
WORD_HEADER_LIGHT_FILL = "DDEBF7"
THIN_BORDER = Border(
    left=Side(style="medium", color="666666"),
    right=Side(style="medium", color="666666"),
    top=Side(style="medium", color="666666"),
    bottom=Side(style="medium", color="666666"),
)


def format_excel_cell(cell, *, header: bool = False, indent: int = 0, percentage: bool = False, bold: bool = False, fill: PatternFill | None = None, horizontal: str | None = None, vertical: str = "center") -> None:
    if isinstance(cell.value, str):
        cell.data_type = "s"
    cell.border = THIN_BORDER
    cell.alignment = Alignment(horizontal=horizontal if horizontal is not None else ("center" if header else "left"), vertical=vertical, indent=indent, wrap_text=True)
    if header:
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
    else:
        cell.font = Font(name="Calibri", bold=bold)
        if fill is not None and fill.patternType:
            cell.fill = fill
    if percentage:
        cell.number_format = "0%"


def style_excel_row(sheet, row_index: int, max_col: int, *, bold: bool = False, fill: PatternFill | None = None, first_col_indent: int = 0, first_col_align: str = "left", other_align: str | None = None) -> None:
    for col in range(1, max_col + 1):
        format_excel_cell(
            sheet.cell(row_index, col),
            indent=first_col_indent if col == 1 else 0,
            bold=bold,
            fill=fill,
            horizontal=first_col_align if col == 1 else other_align,
        )


def add_doc_paragraph(document, text: str, *, bold: bool = False, underline: bool = False, align: int = WD_ALIGN_PARAGRAPH.JUSTIFY, size: int = 12, indent_cm: float | None = 1.25) -> None:
    paragraph = document.add_paragraph()
    paragraph.alignment = align
    if indent_cm is not None:
        paragraph.paragraph_format.first_line_indent = Cm(indent_cm)
    run = paragraph.add_run(text)
    run.bold = bold
    run.underline = underline or (bold and indent_cm is None and align == WD_ALIGN_PARAGRAPH.LEFT)
    run.font.name = "Times New Roman"
    run._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    run.font.size = Pt(size)


def add_doc_title(document, text: str) -> None:
    for line in text.splitlines():
        paragraph = document.add_paragraph()
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = paragraph.add_run(line)
        run.bold = True
        run.font.name = "Times New Roman"
        run._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
        run.font.size = Pt(13)


def add_doc_section_heading(document, text: str) -> None:
    add_doc_paragraph(
        document,
        text,
        bold=True,
        underline=True,
        align=WD_ALIGN_PARAGRAPH.LEFT,
        indent_cm=None,
    )


def add_doc_table_caption(document, title: str) -> str:
    lines = [line.strip() for line in title.splitlines() if line.strip()]
    if not lines:
        return ""
    if lines[0].startswith("Таблица"):
        add_doc_paragraph(document, lines[0], align=WD_ALIGN_PARAGRAPH.RIGHT, indent_cm=None)
        for line in lines[1:]:
            add_doc_paragraph(document, line, align=WD_ALIGN_PARAGRAPH.CENTER, indent_cm=None)
        return lines[0]
    add_doc_paragraph(document, title, align=WD_ALIGN_PARAGRAPH.CENTER, indent_cm=None)
    return title


def _apply_doc_shading(cell, fill: str) -> None:
    tc_pr = cell._tc.get_or_add_tcPr()
    shading = OxmlElement("w:shd")
    shading.set(qn("w:fill"), fill)
    tc_pr.append(shading)


def set_doc_header_row(table_row, texts, *, variant: str = "dark") -> None:
    repeat = OxmlElement("w:tblHeader")
    table_row._tr.get_or_add_trPr().append(repeat)
    fill = WORD_HEADER_DARK_FILL if variant == "dark" else WORD_HEADER_LIGHT_FILL
    use_white_text = variant == "dark"
    for cell, text in zip(table_row.cells, texts):
        cell.text = str(text)
        _apply_doc_shading(cell, fill)
        for paragraph in cell.paragraphs:
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in paragraph.runs:
                run.bold = True
                run.font.bold = True
                if use_white_text:
                    run.font.color.rgb = RGBColor(255, 255, 255)
                run.font.name = "Times New Roman"
                run._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
                run.font.size = Pt(10)


def style_doc_cell(cell, *, bold: bool = False, align: int = WD_ALIGN_PARAGRAPH.LEFT, shaded: bool = False, shade_variant: str = "dark") -> None:
    if shaded:
        _apply_doc_shading(cell, WORD_HEADER_DARK_FILL if shade_variant == "dark" else WORD_HEADER_LIGHT_FILL)
    for paragraph in cell.paragraphs:
        paragraph.alignment = align
        for run in paragraph.runs:
            run.bold = bold
            run.font.bold = bold
            if shaded and shade_variant == "dark":
                run.font.color.rgb = RGBColor(255, 255, 255)
            run.font.name = "Times New Roman"
            run._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
            run.font.size = Pt(10 if shaded else 11)


def style_doc_row(cells, *, bold: bool = False, shaded: bool = False, first_left: bool = True, shade_variant: str = "dark") -> None:
    for index, cell in enumerate(cells):
        style_doc_cell(
            cell,
            bold=bold,
            shaded=shaded,
            shade_variant=shade_variant,
            align=WD_ALIGN_PARAGRAPH.LEFT if first_left and index == 0 else WD_ALIGN_PARAGRAPH.CENTER,
        )
