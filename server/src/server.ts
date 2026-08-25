import "dotenv/config";
import cors from "cors";
import express from "express";

import { participantsRouter } from "./api/participants.api.js";
import { referenceDataRouter } from "./api/reference-data.api.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());
app.use("/api", referenceDataRouter);
app.use("/api", participantsRouter);

function hasPostgresCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

app.use((error: unknown, request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (request.method === "DELETE" && hasPostgresCode(error, "23503")) {
    response.status(409).json({
      error: "REFERENCE_IN_USE",
      message: "Нельзя удалить запись: она используется в других данных",
    });
    return;
  }

  if (request.method === "POST" && hasPostgresCode(error, "23505")) {
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
