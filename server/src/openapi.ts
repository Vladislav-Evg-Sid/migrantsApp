const jsonContent = (schema: object) => ({
  "application/json": { schema },
});

const schemaRef = (name: string) => ({ $ref: `#/components/schemas/${name}` });

const tableDataResponse = {
  description: "Таблица с описанием колонок и строками данных",
  content: jsonContent(schemaRef("TableData")),
};

const emptyResponse = (description: string) => ({ description });

type CrudOptions = {
  path: string;
  tag: string;
  title: string;
  idName: string;
  idDescription: string;
  createSchema: string;
  updateSchema: string;
  getResponseSchema?: string;
  getResponseDescription?: string;
};

function referenceCrudPaths(options: CrudOptions) {
  const parameter = {
    name: options.idName,
    in: "path",
    required: true,
    description: options.idDescription,
    schema: { type: "integer", format: "int64" },
  };
  const getResponse = options.getResponseSchema
    ? {
        description: options.getResponseDescription ?? `Справочник «${options.title}»`,
        content: jsonContent(schemaRef(options.getResponseSchema)),
      }
    : tableDataResponse;

  return {
    [`/${options.path}`]: {
      get: {
        tags: [options.tag],
        summary: `Получить справочник «${options.title}»`,
        responses: {
          200: getResponse,
          500: { description: "Внутренняя ошибка", content: jsonContent(schemaRef("InternalErrorResponse")) },
        },
      },
      post: {
        tags: [options.tag],
        summary: `Добавить запись в справочник «${options.title}»`,
        requestBody: {
          required: true,
          content: jsonContent(schemaRef(options.createSchema)),
        },
        responses: {
          201: emptyResponse("Запись создана"),
          409: {
            description: "Запись с таким первичным ключом уже существует",
            content: jsonContent(schemaRef("ErrorResponse")),
          },
          500: { description: "Внутренняя ошибка", content: jsonContent(schemaRef("ErrorResponse")) },
        },
      },
    },
    [`/${options.path}/{${options.idName}}`]: {
      put: {
        tags: [options.tag],
        summary: `Изменить запись справочника «${options.title}»`,
        parameters: [parameter],
        requestBody: {
          required: true,
          content: jsonContent(schemaRef(options.updateSchema)),
        },
        responses: {
          204: emptyResponse("Запись изменена"),
          500: { description: "Внутренняя ошибка", content: jsonContent(schemaRef("ErrorResponse")) },
        },
      },
      delete: {
        tags: [options.tag],
        summary: `Удалить запись справочника «${options.title}»`,
        parameters: [parameter],
        responses: {
          204: emptyResponse("Запись удалена"),
          409: {
            description: "Запись используется в других данных",
            content: jsonContent(schemaRef("ErrorResponse")),
          },
          500: { description: "Внутренняя ошибка", content: jsonContent(schemaRef("ErrorResponse")) },
        },
      },
    },
  };
}

export const openApiDocument = {
  openapi: "3.0.4",
  info: {
    title: "Migrants App API",
    version: "1.0.0",
    description: "API участников экзамена, результатов и справочных данных.",
  },
  servers: [{ url: "/api", description: "Текущий backend" }],
  tags: [
    { name: "Участники", description: "Общая таблица и карточка участника" },
    { name: "Результаты", description: "Результаты тестирования" },
    { name: "Справочники", description: "Получение и изменение справочных данных" },
  ],
  paths: {
    "/participants": {
      get: {
        tags: ["Участники"],
        summary: "Получить основную информацию обо всех участниках",
        description: "Возвращает ID, ФИО, дату рождения и национальность в формате TableData.",
        responses: {
          200: tableDataResponse,
          500: { description: "Внутренняя ошибка", content: jsonContent(schemaRef("ErrorResponse")) },
        },
      },
      post: {
        tags: ["Участники"],
        summary: "Создать участника вместе с первым экзаменом",
        description: "Backend генерирует ID по коду ППТ, классу и порядковому номеру. Участник и первый экзамен создаются одной транзакцией.",
        requestBody: {
          required: true,
          content: jsonContent(schemaRef("CreateParticipant")),
        },
        responses: {
          201: { description: "Участник и первый экзамен созданы", content: jsonContent(schemaRef("CreatedParticipant")) },
          400: { description: "Некорректный класс или код ППТ отсутствует в справочнике", content: jsonContent(schemaRef("ErrorResponse")) },
          409: { description: "Для сочетания ППТ и класса закончились порядковые номера", content: jsonContent(schemaRef("ErrorResponse")) },
          500: { description: "Внутренняя ошибка", content: jsonContent(schemaRef("ErrorResponse")) },
        },
      },
    },
    "/participants/{id}": {
      get: {
        tags: ["Участники"],
        summary: "Получить карточку участника и все его экзамены",
        parameters: [{
          name: "id",
          in: "path",
          required: true,
          description: "ID участника с учётом дублей",
          schema: { type: "integer", format: "int64", minimum: 1 },
        }],
        responses: {
          200: { description: "Карточка участника", content: jsonContent(schemaRef("ParticipantData")) },
          400: { description: "Некорректный ID", content: jsonContent(schemaRef("ErrorResponse")) },
          404: { description: "Участник не найден", content: jsonContent(schemaRef("ErrorResponse")) },
          500: { description: "Внутренняя ошибка", content: jsonContent(schemaRef("ErrorResponse")) },
        },
      },
      put: {
        tags: ["Участники"],
        summary: "Обновить участника",
        description: "Полностью обновляет поля участника по ID. ID участника и его экзамены не изменяются.",
        parameters: [{
          name: "id",
          in: "path",
          required: true,
          description: "ID участника с учётом дублей",
          schema: { type: "integer", format: "int64", minimum: 1 },
        }],
        requestBody: {
          required: true,
          content: jsonContent(schemaRef("UpdateParticipant")),
        },
        responses: {
          204: emptyResponse("Участник обновлён"),
          400: { description: "Некорректный ID", content: jsonContent(schemaRef("ErrorResponse")) },
          404: { description: "Участник не найден", content: jsonContent(schemaRef("ErrorResponse")) },
          500: { description: "Внутренняя ошибка", content: jsonContent(schemaRef("ErrorResponse")) },
        },
      },
      delete: {
        tags: ["Участники"],
        summary: "Удалить участника",
        description: "Транзакционно удаляет участника и все связанные с ним экзамены.",
        parameters: [{
          name: "id",
          in: "path",
          required: true,
          description: "ID участника с учётом дублей",
          schema: { type: "integer", format: "int64", minimum: 1 },
        }],
        responses: {
          204: emptyResponse("Участник и его экзамены удалены"),
          400: { description: "Некорректный ID", content: jsonContent(schemaRef("ErrorResponse")) },
          404: { description: "Участник не найден", content: jsonContent(schemaRef("ErrorResponse")) },
          409: { description: "Удаление запрещено существующими связями", content: jsonContent(schemaRef("ErrorResponse")) },
          500: { description: "Внутренняя ошибка", content: jsonContent(schemaRef("ErrorResponse")) },
        },
      },
    },
    "/participants/{id}/test-results": {
      get: {
        tags: ["Результаты"],
        summary: "Получить все экзамены участника",
        description: "Возвращает только таблицу экзаменов участника в формате TableData.",
        parameters: [{
          name: "id",
          in: "path",
          required: true,
          description: "ID участника с учётом дублей",
          schema: { type: "integer", format: "int64", minimum: 1 },
        }],
        responses: {
          200: tableDataResponse,
          400: { description: "Некорректный ID", content: jsonContent(schemaRef("ErrorResponse")) },
          404: { description: "Участник не найден", content: jsonContent(schemaRef("ErrorResponse")) },
          500: { description: "Внутренняя ошибка", content: jsonContent(schemaRef("ErrorResponse")) },
        },
      },
    },
    "/test-results": {
      post: {
        tags: ["Результаты"],
        summary: "Создать экзаменационную попытку участника",
        description: "ID результата генерируется PostgreSQL. Тело успешного ответа пустое.",
        requestBody: {
          required: true,
          content: jsonContent(schemaRef("CreateTestResult")),
        },
        responses: {
          201: { description: "Результат создан, тело ответа пустое" },
          500: { description: "Внутренняя ошибка", content: jsonContent(schemaRef("ErrorResponse")) },
        },
      },
    },
    "/test-results/dates/{testDateId}/ppts": {
      get: {
        tags: ["Результаты"],
        summary: "Получить все ППТ с количеством участников на выбранную дату",
        description: "Возвращает весь справочник ППТ в формате TableData. Для каждого ППТ указывает количество участников в выбранную дату; если экзаменов не было, возвращает 0.",
        parameters: [{
          name: "testDateId",
          in: "path",
          required: true,
          description: "ID даты из справочника test_dates",
          schema: { type: "integer", minimum: 1 },
        }],
        responses: {
          200: tableDataResponse,
          400: { description: "Некорректный ID даты", content: jsonContent(schemaRef("ErrorResponse")) },
          404: { description: "Дата экзамена не найдена", content: jsonContent(schemaRef("ErrorResponse")) },
          500: { description: "Внутренняя ошибка", content: jsonContent(schemaRef("ErrorResponse")) },
        },
      },
    },
    "/test-results/{id}": {
      put: {
        tags: ["Результаты"],
        summary: "Обновить экзамен",
        description: "Полностью обновляет экзамен по его ID. participantId передаётся в теле и может быть обновлён.",
        parameters: [{
          name: "id",
          in: "path",
          required: true,
          description: "ID экзамена",
          schema: { type: "integer", minimum: 1 },
        }],
        requestBody: {
          required: true,
          content: jsonContent(schemaRef("UpdateTestResult")),
        },
        responses: {
          204: emptyResponse("Экзамен обновлён"),
          400: { description: "Некорректный ID или код результата", content: jsonContent(schemaRef("ErrorResponse")) },
          404: { description: "Экзамен не найден", content: jsonContent(schemaRef("ErrorResponse")) },
          500: { description: "Внутренняя ошибка", content: jsonContent(schemaRef("ErrorResponse")) },
        },
      },
      delete: {
        tags: ["Результаты"],
        summary: "Удалить экзамен",
        description: "Удаляет один экзамен по ID строки test_results. Участник не удаляется.",
        parameters: [{
          name: "id",
          in: "path",
          required: true,
          description: "ID экзамена",
          schema: { type: "integer", minimum: 1 },
        }],
        responses: {
          204: emptyResponse("Экзамен удалён"),
          400: { description: "Некорректный ID", content: jsonContent(schemaRef("ErrorResponse")) },
          404: { description: "Экзамен не найден", content: jsonContent(schemaRef("ErrorResponse")) },
          409: { description: "Удаление запрещено существующими связями", content: jsonContent(schemaRef("ErrorResponse")) },
          500: { description: "Внутренняя ошибка", content: jsonContent(schemaRef("ErrorResponse")) },
        },
      },
    },
    "/test-results/head": {
      get: {
        tags: ["Результаты"],
        summary: "Получить шапку таблицы экзаменов",
        description: "Возвращает ту же шапку, которая используется в таблице экзаменов карточки участника.",
        responses: {
          200: {
            description: "Шапка формы экзамена",
            content: jsonContent({ type: "array", items: schemaRef("TableHeadCell") }),
          },
          500: { description: "Внутренняя ошибка", content: jsonContent(schemaRef("ErrorResponse")) },
        },
      },
    },
    ...referenceCrudPaths({ path: "areas", tag: "Справочники", title: "Муниципальные образования", idName: "code", idDescription: "Код МО", createSchema: "CreateArea", updateSchema: "UpdateArea" }),
    ...referenceCrudPaths({ path: "schools", tag: "Справочники", title: "Школы", idName: "code", idDescription: "Код школы", createSchema: "CreateSchool", updateSchema: "UpdateSchool" }),
    ...referenceCrudPaths({ path: "ppts", tag: "Справочники", title: "ППТ", idName: "code", idDescription: "Код ППТ", createSchema: "CreatePpt", updateSchema: "UpdatePpt" }),
    ...referenceCrudPaths({ path: "area-responsibles", tag: "Справочники", title: "Ответственные по МО", idName: "id", idDescription: "ID ответственного", createSchema: "CreateAreaResponsible", updateSchema: "UpdateAreaResponsible" }),
    ...referenceCrudPaths({ path: "nations", tag: "Справочники", title: "Национальности", idName: "id", idDescription: "ID национальности", createSchema: "CreateName", updateSchema: "CreateName" }),
    ...referenceCrudPaths({ path: "participant-statuses", tag: "Справочники", title: "Статусы участников", idName: "id", idDescription: "ID статуса", createSchema: "CreateName", updateSchema: "CreateName" }),
    ...referenceCrudPaths({
      path: "test-dates",
      tag: "Справочники",
      title: "Даты тестирования",
      idName: "id",
      idDescription: "ID даты",
      createSchema: "CreateTestDate",
      updateSchema: "CreateTestDate",
      getResponseSchema: "ExamDates",
      getResponseDescription: "Даты экзаменов, сгруппированные по году и месяцу",
    }),
    ...referenceCrudPaths({ path: "test-attempts", tag: "Справочники", title: "Кратность участия", idName: "number", idDescription: "Номер попытки", createSchema: "CreateTestAttempt", updateSchema: "UpdateTestAttempt" }),
  },
  components: {
    schemas: {
      ForeignKey: {
        type: "object",
        required: ["code", "name"],
        properties: {
          code: { type: "integer", format: "int64" },
          name: { type: "string" },
        },
      },
      SelectOption: {
        type: "object",
        required: ["code", "name"],
        properties: {
          code: { type: "integer", format: "int64", nullable: true },
          name: { type: "string" },
        },
      },
      TableHeadCell: {
        type: "object",
        required: ["cell", "type"],
        properties: {
          cell: { type: "string" },
          type: {
            oneOf: [
              { type: "string", enum: ["string", "number", "phone", "email", "date", "boolean"] },
              { type: "array", items: schemaRef("SelectOption") },
            ],
          },
        },
      },
      TableCell: {
        nullable: true,
        oneOf: [
          { type: "string" },
          { type: "number" },
          { type: "boolean" },
          schemaRef("ForeignKey"),
        ],
      },
      TableData: {
        type: "object",
        required: ["head", "body"],
        properties: {
          head: { type: "array", items: schemaRef("TableHeadCell") },
          body: {
            type: "array",
            items: {
              type: "object",
              required: ["row"],
              properties: { row: { type: "array", items: schemaRef("TableCell") } },
            },
          },
        },
      },
      ExamDateId: {
        type: "object",
        required: ["id", "day"],
        properties: {
          id: { type: "integer", minimum: 1 },
          day: { type: "integer", minimum: 1, maximum: 31 },
        },
      },
      ExamDates: {
        type: "array",
        description: "Массив пар [год, месяцы], где месяцы — массив пар [номер месяца, DateId[]]. После JSON-декодирования преобразуется в Map<number, Map<Month, DateId[]>>.",
        items: {
          type: "array",
          minItems: 2,
          maxItems: 2,
          items: {
            oneOf: [
              { type: "integer", description: "Год" },
              {
                type: "array",
                description: "Массив пар [месяц, DateId[]]",
                items: {
                  type: "array",
                  minItems: 2,
                  maxItems: 2,
                },
              },
            ],
          },
        },
        example: [
          [2025, [[4, [{ id: 1, day: 24 }, { id: 2, day: 30 }]]]],
          [2026, [[1, [{ id: 17, day: 14 }]]]],
        ],
      },
      ParticipantData: {
        type: "object",
        required: ["id", "surname", "name", "patronymic", "birthDate", "nation", "school", "nextExamDate", "schoolComment", "rcoiNote", "exams"],
        properties: {
          id: { type: "integer", format: "int64", example: 7204300601 },
          surname: { type: "string" },
          name: { type: "string" },
          patronymic: { type: "string", nullable: true },
          birthDate: { type: "string", pattern: "^\\d{2}\\.\\d{2}\\.\\d{4}$", example: "13.07.2013" },
          nation: schemaRef("ForeignKey"),
          school: { allOf: [schemaRef("ForeignKey")], nullable: true },
          nextExamDate: { type: "string", nullable: true, description: "Дата или исходное текстовое плановое значение" },
          schoolComment: { type: "string", nullable: true },
          rcoiNote: { type: "string", nullable: true },
          exams: schemaRef("TableData"),
        },
      },
      CreateParticipant: {
        type: "object",
        required: ["surname", "name", "patronymic", "birthDay", "birthMonth", "birthYear", "nationId", "confirmedSchoolCode", "nextPlannedDate", "comment", "rcoiNote", "firstExam"],
        properties: {
          surname: { type: "string", maxLength: 127 },
          name: { type: "string", maxLength: 127 },
          patronymic: { type: "string", maxLength: 127, nullable: true },
          birthDay: { type: "integer", minimum: 1, maximum: 31 },
          birthMonth: { type: "integer", minimum: 1, maximum: 12 },
          birthYear: { type: "integer", minimum: 1900 },
          nationId: { type: "integer" },
          confirmedSchoolCode: { type: "integer", nullable: true },
          nextPlannedDate: { type: "string", nullable: true },
          comment: { type: "string", nullable: true },
          rcoiNote: { type: "string", nullable: true },
          firstExam: schemaRef("CreateFirstTestResult"),
        },
      },
      UpdateParticipant: {
        type: "object",
        required: ["surname", "name", "patronymic", "birthDay", "birthMonth", "birthYear", "nationId", "confirmedSchoolCode", "nextPlannedDate", "comment", "rcoiNote"],
        properties: {
          surname: { type: "string", maxLength: 127 },
          name: { type: "string", maxLength: 127 },
          patronymic: { type: "string", maxLength: 127, nullable: true },
          birthDay: { type: "integer", minimum: 1, maximum: 31 },
          birthMonth: { type: "integer", minimum: 1, maximum: 12 },
          birthYear: { type: "integer", minimum: 1900 },
          nationId: { type: "integer" },
          confirmedSchoolCode: { type: "integer", nullable: true },
          nextPlannedDate: { type: "string", nullable: true },
          comment: { type: "string", nullable: true },
          rcoiNote: { type: "string", nullable: true },
        },
      },
      CreateFirstTestResult: {
        type: "object",
        required: ["isSpecialCategory", "statusId", "testDateId", "result", "class", "sendingSchoolCode", "testAttemptNumber", "appealId", "testingCenterPptCode"],
        properties: {
          isSpecialCategory: { type: "boolean" },
          statusId: { type: "integer", nullable: true },
          testDateId: { type: "integer" },
          result: { type: "integer", enum: [1, 2, 3], nullable: true, description: "1 — Зачет, 2 — Незачет, 3 — Неявка" },
          class: { type: "integer", minimum: 1, maximum: 11 },
          sendingSchoolCode: { type: "integer" },
          testAttemptNumber: { type: "integer", minimum: 1 },
          appealId: { type: "integer", nullable: true },
          testingCenterPptCode: { type: "integer", minimum: 1, maximum: 9999 },
        },
      },
      CreateTestResult: {
        type: "object",
        required: ["participantId", "isSpecialCategory", "statusId", "testDateId", "result", "class", "sendingSchoolCode", "testAttemptNumber", "appealId", "testingCenterPptCode"],
        properties: {
          participantId: { type: "integer", format: "int64" },
          isSpecialCategory: { type: "boolean" },
          statusId: { type: "integer", nullable: true },
          testDateId: { type: "integer" },
          result: { type: "integer", enum: [1, 2, 3], nullable: true, description: "1 — Зачет, 2 — Незачет, 3 — Неявка" },
          class: { type: "integer", minimum: 1, maximum: 11 },
          sendingSchoolCode: { type: "integer" },
          testAttemptNumber: { type: "integer", minimum: 1 },
          appealId: { type: "integer", nullable: true },
          testingCenterPptCode: { type: "integer" },
        },
      },
      UpdateTestResult: schemaRef("CreateTestResult"),
      CreatedParticipant: {
        type: "object",
        required: ["id"],
        properties: {
          id: { type: "integer", format: "int64", example: 7204130301 },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["error", "message"],
        properties: { error: { type: "string" }, message: { type: "string" } },
      },
      InternalErrorResponse: {
        type: "object",
        required: ["error"],
        properties: { error: { type: "string", example: "Internal server error" } },
      },
      CreateArea: {
        type: "object", required: ["code", "name"],
        properties: { code: { type: "integer" }, name: { type: "string" } },
      },
      UpdateArea: {
        type: "object", required: ["name"], properties: { name: { type: "string" } },
      },
      CreateSchool: {
        type: "object", required: ["code", "name", "address", "areaCode"],
        properties: { code: { type: "integer" }, name: { type: "string" }, address: { type: "string" }, areaCode: { type: "integer" } },
      },
      UpdateSchool: {
        type: "object", required: ["name", "address", "areaCode"],
        properties: { name: { type: "string" }, address: { type: "string" }, areaCode: { type: "integer" } },
      },
      CreatePpt: {
        type: "object", required: ["code", "schoolCode", "responsibleName", "responsiblePhone"],
        properties: { code: { type: "integer" }, schoolCode: { type: "integer" }, responsibleName: { type: "string" }, responsiblePhone: { type: "string", pattern: "^\\d{11}$" } },
      },
      UpdatePpt: {
        type: "object", required: ["schoolCode", "responsibleName", "responsiblePhone"],
        properties: { schoolCode: { type: "integer" }, responsibleName: { type: "string" }, responsiblePhone: { type: "string", pattern: "^\\d{11}$" } },
      },
      CreateAreaResponsible: {
        type: "object", required: ["areaCode", "name", "phone", "mail"],
        properties: { areaCode: { type: "integer" }, name: { type: "string" }, phone: { type: "string", pattern: "^\\d{11}$" }, mail: { type: "string", format: "email" } },
      },
      UpdateAreaResponsible: { $ref: "#/components/schemas/CreateAreaResponsible" },
      CreateName: {
        type: "object", required: ["name"], properties: { name: { type: "string" } },
      },
      CreateTestDate: {
        type: "object", required: ["day", "month", "year"],
        properties: { day: { type: "integer", minimum: 1, maximum: 31 }, month: { type: "integer", minimum: 1, maximum: 12 }, year: { type: "integer", minimum: 2000 } },
      },
      CreateTestAttempt: {
        type: "object", required: ["number", "name"],
        properties: { number: { type: "integer", minimum: 1 }, name: { type: "string" } },
      },
      UpdateTestAttempt: {
        type: "object", required: ["name"], properties: { name: { type: "string" } },
      },
    },
  },
} as const;
