from __future__ import annotations

import math
from collections import Counter
from dataclasses import dataclass
from datetime import date, datetime
from typing import Sequence

STATUS_CANONICAL = {
    "сдал": "Сдал",
    "уехал за пределы рф": "Уехал за пределы РФ",
    "уехал за пределы области": "Уехал за пределы области",
    "готовится к повторному тестированию в этносе": "Готовится к повторному тестированию в Этносе",
    "готовится к повторному тестированию с репетитором": "Готовится к повторному тестированию с репетитором",
    "готовится к повторному тестированию в оо": "Готовится к повторному тестированию в ОО",
    "получил гражданство рф": "Получил гражданство РФ",
    "получает гражданство рф": "Получает гражданство РФ",
    "не дозвонились/нет данных": "Не дозвонились / нет данных",
    "обучается в частной школе": "Обучается в частной школе",
    "остался в детском саду": "Остался в детском саду",
    "состоит в реестре контролируемых лиц": "Состоит в реестре контролируемых лиц",
    "не определились с дальнейшей траекторией": "Не определились с дальнейшей траекторией",
    "предоставили неполный пакет документов": "Предоставили неполный пакет документов",
    "поступил / поступает в колледж": "Поступил / поступает в колледж",
    "тестирование проходить не хотят": "Тестирование проходить не хотят",
    "участвовал в тестировании по ошибке оо ( перевод из одной оо в другую)": "Участвовал в тестировании по ошибке ОО",
    "проходит онлайн обучение в школе за пределами рф": "Проходит онлайн-обучение за пределами РФ",
    "планирует обучение с следующего учебного года": "Планирует обучение со следующего учебного года",
    "хорошо говорят по рус": "Хорошо говорят по-русски",
    "неявка": "Неявка",
    "заявился на 13.03.26": "Заявился на следующее тестирование",
    "": "Статус не указан",
}

COUNTRY_CANONICAL = {
    "киргизия": "Киргизия",
    "кыргызстан": "Киргизия",
    "таджикистан": "Таджикистан",
    "казахстан": "Казахстан",
    "азербайджан": "Азербайджан",
    "узбекистан": "Узбекистан",
    "армения": "Армения",
    "молдова": "Молдова",
    "туркмения": "Туркмения",
    "туркменистан": "Туркмения",
    "германия": "Германия",
    "украина": "Украина",
    "грузия": "Грузия",
    "китай": "Китай",
    "китайская народная республика": "Китай",
    "эстония": "Эстония",
}

MULTIPLICITY_ORDER = ["первый", "второй", "третий", "четвертый", "пятый", "шестой", "седьмой", "восьмой"]
MULTIPLICITY_ORDER += ["девятый", "десятый", "одиннадцатый", "двенадцатый", "тринадцатый", "четырнадцатый", "пятнадцатый", "шестнадцатый", "семнадцатый", "восемнадцатый", "девятнадцатый", "двадцатый"]
MONTHS_RU = {
    1: "январь",
    2: "февраль",
    3: "март",
    4: "апрель",
    5: "май",
    6: "июнь",
    7: "июль",
    8: "август",
    9: "сентябрь",
    10: "октябрь",
    11: "ноябрь",
    12: "декабрь",
}
EXCLUDED_WAITING_STATUSES = {
    "сдал",
    "получил гражданство рф",
    "получает гражданство рф",
    "уехал за пределы рф",
    "уехал за пределы области",
    "поступил / поступает в колледж",
    "остался в детском саду",
}


@dataclass(frozen=True)
class PersonRecord:
    uid: str
    internal_id: str
    mo: str
    last_name: str
    first_name: str
    middle_name: str
    birth_date: date | None
    citizenship: str
    multiplicity: str
    school_code: str
    grade: int | None
    test_point_code: str
    special_category: str
    test_date: date
    pass_result: str | None
    status: str
    retest_date: date | None
    school_after_citizenship: str
    comment: str
    rc_comment: str
    test_point_name: str
    appeal: str
    source_row: tuple[object, ...] = ()


def normalize_text(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and math.isnan(value):
        return ""
    return " ".join(str(value).replace("\xa0", " ").strip().split())


def normalize_result(value: object) -> str | None:
    text = normalize_text(value).lower()
    if not text:
        return None
    return {"да": "да", "нет": "нет", "неявка": "неявка"}.get(text, text)


def normalize_status(value: object) -> str:
    return normalize_text(value).lower()


def status_label(status: str) -> str:
    return STATUS_CANONICAL.get(status, status.capitalize() if status else "Статус не указан")


def normalize_country(value: object) -> str:
    text = normalize_text(value)
    return COUNTRY_CANONICAL.get(text.lower(), text)


def normalize_special(value: object) -> str:
    return "да" if normalize_text(value).lower() == "да" else "нет"


def normalize_multiplicity(value: object) -> str:
    return normalize_text(value).lower()


def normalize_date(value: object) -> date | None:
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return None


def safe_int(value: object) -> int | None:
    if value is None:
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        if math.isnan(value):
            return None
        return int(value)
    text = normalize_text(value)
    if not text:
        return None
    try:
        return int(float(text.replace(",", ".")))
    except ValueError:
        return None


def format_ru_date(value: date) -> str:
    return value.strftime("%d.%m.%Y")


def format_short_ru(value: date) -> str:
    return value.strftime("%d.%m.%y")


def format_month_title(value: date) -> str:
    return MONTHS_RU[value.month]


def percent(value: int, total: int) -> float | None:
    if not total:
        return None
    return value / total


def percent_text(value: int, total: int) -> str:
    if not total:
        return "0%"
    return f"{round(value / total * 100)}%"


def country_genitive(name: str) -> str:
    name = normalize_text(name)
    if not name:
        return name
    mapping = {
        "Киргизия": "Киргизии",
        "Таджикистан": "Таджикистана",
        "Казахстан": "Казахстана",
        "Азербайджан": "Азербайджана",
        "Узбекистан": "Узбекистана",
        "Армения": "Армении",
        "Молдова": "Молдовы",
        "Туркмения": "Туркмении",
        "Германия": "Германии",
        "Украина": "Украины",
        "Грузия": "Грузии",
        "Китай": "Китая",
        "Эстония": "Эстонии",
        "Беларусь": "Беларуси",
        "Белоруссия": "Белоруссии",
        "Россия": "России",
        "Турция": "Турции",
        "Сирия": "Сирии",
        "Индия": "Индии",
        "Сербия": "Сербии",
        "Болгария": "Болгарии",
        "Монголия": "Монголии",
        "Латвия": "Латвии",
        "Литва": "Литвы",
        "Польша": "Польши",
        "Чехия": "Чехии",
        "Словакия": "Словакии",
        "Словения": "Словении",
        "Хорватия": "Хорватии",
        "Румыния": "Румынии",
        "Франция": "Франции",
        "Италия": "Италии",
        "Испания": "Испании",
        "Австрия": "Австрии",
        "Австралия": "Австралии",
        "Бразилия": "Бразилии",
        "Финляндия": "Финляндии",
        "Швеция": "Швеции",
        "Норвегия": "Норвегии",
        "Япония": "Японии",
        "Греция": "Греции",
        "Нидерланды": "Нидерландов",
        "США": "США",
        "ОАЭ": "ОАЭ",
    }
    if name in mapping:
        return mapping[name]
    if name.endswith("ия"):
        return f"{name[:-2]}ии"
    if name.endswith("ея"):
        return f"{name[:-2]}еи"
    if name.endswith("стан"):
        return f"{name}а"
    if name.endswith("й"):
        return f"{name[:-1]}я"
    if name.endswith("ь"):
        return f"{name[:-1]}и"
    if len(name) > 1 and name.endswith("а"):
        return f"{name[:-1]}{'и' if name[-2] in 'гкхжчшщ' else 'ы'}"
    if name[-1] in "бвгджзклмнпрстфхцчшщ":
        return f"{name}а"
    return name


def mo_prepositional(name: str) -> str:
    name = normalize_text(name)
    if not name:
        return name
    compact = name.replace("г. ", "г.").replace("г .", "г.")
    city_mapping = {
        "г.Тюмень": "г. Тюмени",
        "г.Тобольск": "г. Тобольске",
        "г.Ишим": "г. Ишиме",
        "г.Ялуторовск": "г. Ялуторовске",
    }
    if compact in city_mapping:
        return city_mapping[compact]
    explicit_mapping = {
        "Казанский": "Казанском",
        "Вагайский": "Вагайском",
        "Уватский": "Уватском",
        "Заводоуковский": "Заводоуковском",
        "Тюменский": "Тюменском",
        "Ялуторовский": "Ялуторовском",
        "Бердюжский": "Бердюжском",
        "Тобольский": "Тобольском",
        "Ярковский": "Ярковском",
        "Исетский": "Исетском",
        "Армизонский": "Армизонском",
        "Сорокинский": "Сорокинском",
        "Сладковский": "Сладковском",
        "Голышмановский": "Голышмановском",
        "Упоровский": "Упоровском",
        "Нижнетавдинский": "Нижнетавдинском",
        "Аромашевский": "Аромашевском",
        "Омутинский": "Омутинском",
        "Викуловский": "Викуловском",
        "Ишимский": "Ишимском",
        "Юргинский": "Юргинском",
        "Абатский": "Абатском",
    }
    if name in explicit_mapping:
        return explicit_mapping[name]
    if name.endswith(" МО"):
        base = name[:-3]
        base_form = mo_prepositional(base)
        return f"{base_form} МО" if base_form != base else name
    if name.endswith("ский"):
        return f"{name[:-4]}ском"
    if name.endswith("жский"):
        return f"{name[:-5]}жском"
    return name


def join_human(items: Sequence[str]) -> str:
    items = [item for item in items if item]
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} и {items[1]}"
    return f"{', '.join(items[:-1])} и {items[-1]}"


def count_with_percent(value: int, total: int) -> str:
    if not total:
        return str(value)
    return f"{value} ({percent_text(value, total)})"


def number_rows(rows: Sequence[dict]) -> list[dict]:
    numbered = []
    index = 1
    for row in rows:
        copied = dict(row)
        if copied.get("label") == "Общий итог":
            copied["row_no"] = ""
        elif copied.get("level", 0) == 0:
            copied["row_no"] = index
            index += 1
        else:
            copied["row_no"] = ""
        numbered.append(copied)
    return numbered


def top_non_total(rows: Sequence[dict], limit: int = 3) -> list[dict]:
    return [row for row in rows if row.get("label") != "Общий итог"][:limit]
