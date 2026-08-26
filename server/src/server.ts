import "dotenv/config";
import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";

import { participantsRouter } from "./api/participants.api.js";
import { referenceDataRouter } from "./api/reference-data.api.js";
import { testResultsRouter } from "./api/test-results.api.js";
import { openApiDocument } from "./openapi.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());
app.get("/openapi.json", (_request, response) => response.json(openApiDocument));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument, {
  customSiteTitle: "Migrants App API — Swagger",
  swaggerOptions: { displayRequestDuration: true },
}));
app.use("/api", referenceDataRouter);
app.use("/api", participantsRouter);
app.use("/api", testResultsRouter);

function hasErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

app.use((error: unknown, request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (hasErrorCode(error, "INVALID_PARTICIPANT_ID_SOURCE")) {
    response.status(400).json({
      error: "INVALID_PARTICIPANT_ID_SOURCE",
      message: "Для генерации ID нужны корректные код ППТ и класс",
    });
    return;
  }

  if (hasErrorCode(error, "PPT_NOT_FOUND")) {
    response.status(400).json({
      error: "PPT_NOT_FOUND",
      message: "ППТ с переданным кодом не найден",
    });
    return;
  }

  if (hasErrorCode(error, "PARTICIPANT_SEQUENCE_EXHAUSTED")) {
    response.status(409).json({
      error: "PARTICIPANT_SEQUENCE_EXHAUSTED",
      message: "Для сочетания ППТ и класса уже создано 99 участников",
    });
    return;
  }

  if (request.method === "DELETE" && hasErrorCode(error, "23503")) {
    response.status(409).json({
      error: "REFERENCE_IN_USE",
      message: "Нельзя удалить запись: она используется в других данных",
    });
    return;
  }

  if (request.method === "POST" && hasErrorCode(error, "23505")) {
    response.status(409).json({
      error: "DUPLICATE_PRIMARY_KEY",
      message: "Запись с таким первичным ключом уже существует",
    });
    return;
  }

  console.error(error);
  response.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`API is listening on http://localhost:${port}`);
});
