"""Read and validate the first sheet before Express starts a DB transaction."""
import io
import json
import re
import sys
import warnings
from datetime import date, datetime
from pathlib import Path
from zipfile import ZipFile

import openpyxl


def text(value):
    return " ".join(str(value).split()) if value is not None else ""


def integer(value, label, optional=False):
    if optional and not text(value):
        return None
    raw = text(value)
    if not re.fullmatch(r"\d+(?:\.0+)?", raw):
        raise ValueError(f"{label}: требуется целое число")
    number = int(float(raw))
    if not 0 < number <= 9007199254740991:
        raise ValueError(f"{label}: некорректное число")
    return number


def parse_date(value, label, optional=False):
    if not text(value) and optional:
        return None
    if isinstance(value, (date, datetime)):
        return value.strftime("%Y-%m-%d")
    for pattern in ("%d.%m.%Y", "%Y-%m-%d", "%d.%m.%y", "%d/%m/%Y"):
        try:
            return datetime.strptime(text(value), pattern).strftime("%Y-%m-%d")
        except ValueError:
            pass
    raise ValueError(f"{label}: укажите дату в формате ДД.ММ.ГГГГ")


def parse(data):
    with ZipFile(io.BytesIO(data)) as archive:
        if sum(item.file_size for item in archive.infolist()) > 128 * 1024 * 1024:
            raise ValueError("Файл слишком большой. Загрузите сводную меньшего размера.")
    warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")
    workbook = openpyxl.load_workbook(io.BytesIO(data), read_only=True, data_only=True)
    try:
        sheet = workbook.worksheets[0]
        expected = json.loads((Path(__file__).resolve().parents[1] / "reports/source-layout.json").read_text(encoding="utf-8"))["headers"]
        headers = next(sheet.iter_rows(min_row=1, max_row=1, values_only=True), ())
        if len(headers) < 23 or any(text(headers[i]).lower() != text(expected[i]).lower() for i in range(23)):
            raise ValueError("Структура файла не соответствует сводной. Проверьте заголовки первого листа.")
        rows, issues = [], []
        for number, values in enumerate(sheet.iter_rows(min_row=2, values_only=True), 2):
            if number > 100001:
                raise ValueError("В файле больше 100 000 строк.")
            values = list(values) + [None] * max(0, 24 - len(values))
            if not any(text(value) for value in values[1:17]):
                continue
            try:
                uid = integer(values[2] or values[1], "ID участника")
                birth = parse_date(values[7], "Дата рождения", optional=True)
                day = parse_date(values[14], "Дата тестирования")
                if birth and not "1900-01-01" <= birth <= date.today().isoformat():
                    raise ValueError("Дата рождения вне допустимого диапазона")
                result = text(values[15]).lower().replace("ё", "е")
                result_map = {"": None, "да": "Зачет", "зачет": "Зачет", "нет": "Незачет", "незачет": "Незачет", "неявка": "Неявка"}
                if result not in result_map:
                    raise ValueError("Зачёт: допустимы да, нет, неявка или пустое значение")
                special = text(values[13]).lower()
                if special not in ("", "да", "нет"):
                    raise ValueError("Особая категория: допустимы да или нет")
                grade = integer(values[11], "Класс")
                if grade > 11:
                    raise ValueError("Класс должен быть от 1 до 11")
                required = [(4,"Фамилия"),(5,"Имя"),(8,"Гражданство"),(9,"Кратность тестирования")]
                for index, label in required:
                    if not text(values[index]):
                        raise ValueError(f"{label}: поле не заполнено")
                for index in (4, 5, 6, 8, 16):
                    if len(text(values[index])) > 127:
                        raise ValueError(f"Слишком длинное значение в столбце «{expected[index]}»")
                planned = text(values[17]) or None
                if planned:
                    try:
                        planned = parse_date(values[17], "Дата повторного тестирования")
                    except ValueError:
                        pass
                rows.append(dict(row=number, id=str(uid), surname=text(values[4]), name=text(values[5]),
                    patronymic=text(values[6]) or None, birth=birth, nation=text(values[8]),
                    attempt=text(values[9]).lower().replace("ё", "е"), school=integer(values[10],"Код ОО"),
                    grade=grade, ppt=integer(values[12],"ППТ"), special=special == "да", date=day,
                    result=result_map[result], status=text(values[16]) or None, planned=planned,
                    confirmedSchool=text(values[18]) or None, comment=text(values[19]) or None,
                    note=text(values[20]) or None, appeal=text(values[23]) or None))
            except ValueError as error:
                issues.append(f"Строка {number}: {error}")
                if len(issues) >= 30:
                    break
        if not rows and not issues:
            issues.append("В файле нет данных об участниках и тестированиях.")
        return dict(rows=rows if not issues else [], issues=issues)
    finally:
        workbook.close()


if __name__ == "__main__":
    try:
        result = parse(sys.stdin.buffer.read())
    except Exception as error:
        result = dict(rows=[], issues=[str(error) if isinstance(error, ValueError) else "Не удалось прочитать Excel-файл. Проверьте, что это сводная в формате .xlsx."])
    print(json.dumps(result, ensure_ascii=False))
