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
};

function referenceCrudPaths(options: CrudOptions) {
  const parameter = {
    name: options.idName,
    in: "path",
    required: true,
    description: options.idDescription,
    schema: { type: "integer", format: "int64" },
  };

  return {
    [`/${options.path}`]: {
      get: {
        tags: [options.tag],
        summary: `Получить справочник «${options.title}»`,
        responses: {
          200: tableDataResponse,
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
    },
    "/test-results": {
      get: {
        tags: ["Результаты"],
        summary: "Получить все строки таблицы результатов",
        responses: {
          200: {
            description: "Массив результатов",
            content: jsonContent({ type: "array", items: schemaRef("TestResult") }),
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
    ...referenceCrudPaths({ path: "test-dates", tag: "Справочники", title: "Даты тестирования", idName: "id", idDescription: "ID даты", createSchema: "CreateTestDate", updateSchema: "CreateTestDate" }),
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
      TableHeadCell: {
        type: "object",
        required: ["cell", "type"],
        properties: {
          cell: { type: "string" },
          type: {
            oneOf: [
              { type: "string", enum: ["string", "number", "phone", "email", "date", "boolean"] },
              { type: "array", items: schemaRef("ForeignKey") },
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
      TestResult: {
        type: "object",
        required: ["id", "participant_id", "is_special_category", "status_id", "test_date_id", "result", "class", "sending_school_code", "test_attempt_number", "appeal_id", "testing_center_ppt_code"],
        properties: {
          id: { type: "integer" },
          participant_id: { type: "integer", format: "int64" },
          is_special_category: { type: "boolean" },
          status_id: { type: "integer", nullable: true },
          test_date_id: { type: "integer" },
          result: { type: "string", enum: ["Да", "Нет", "Неявка"], nullable: true },
          class: { type: "integer", minimum: 1, maximum: 11 },
          sending_school_code: { type: "integer" },
          test_attempt_number: { type: "integer" },
          appeal_id: { type: "integer", nullable: true },
          testing_center_ppt_code: { type: "integer" },
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
