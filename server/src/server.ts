import "dotenv/config";
import cors from "cors";
import express from "express";

import { pool } from "./db.js";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

app.get("/api/health", async (_request, response) => {
  try {
    await pool.query("SELECT 1");
    response.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error(error);
    response.status(500).json({ status: "error", database: "unavailable" });
  }
});

app.listen(port, () => {
  console.log(`API is listening on http://localhost:${port}`);
});
