import "dotenv/config";
import cors from "cors";
import express from "express";

import { referenceDataRouter } from "./api/reference-data.api.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());
app.use("/api", referenceDataRouter);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`API is listening on http://localhost:${port}`);
});
