const options = {
  type: "object", required: ["startDate", "endDate", "dates", "recalculate"],
  properties: {
    startDate: { type: "string", format: "date" }, endDate: { type: "string", format: "date" },
    dates: { type: "array", items: { type: "string", format: "date" }, description: "Контрольные даты только для статистики ИГ; для остальных отчётов []" },
    recalculate: { type: "boolean", description: "Пересчитать кратность внутри периода; БД не изменяется" },
  },
};

export const reportPaths = {
  "/reports/dates": {
    get: {
      tags: ["Отчёты"], summary: "Даты тестирований с числом записей и завершённых попыток",
      responses: { 200: { description: "Массив {date, records, completed}", content: { "application/json": { schema: { type: "array", items: { type: "object", properties: { date: { type: "string", format: "date" }, records: { type: "integer" }, completed: { type: "integer" } } } } } } } },
    },
  },
  "/reports/{kind}": {
    post: {
      tags: ["Отчёты"], summary: "Построить и скачать Word / Excel / ZIP",
      description: "Период включительно. Для analytical даты построения не влияют на справку. summary с recalculate=true возвращает ZIP с исходной и пересчитанной таблицами.",
      parameters: [{ name: "kind", in: "path", required: true, schema: { type: "string", enum: ["analytical", "statistics", "summary"] } }],
      requestBody: { required: true, content: { "application/json": { schema: options } } },
      responses: {
        200: { description: "Файл attachment", content: Object.fromEntries([
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/zip",
        ].map(type => [type, { schema: { type: "string", format: "binary" } }])) },
        400: { description: "Некорректные параметры" }, 404: { description: "Отчёт не найден" },
        409: { description: "Другой отчёт ещё формируется" }, 422: { description: "Нет данных за период" },
        503: { description: "Python недоступен" }, 504: { description: "Истекло время построения" },
      },
    },
  },
};
