import { Router } from "express";

import { getTestResults } from "../services/test-results.service.js";

export const testResultsRouter = Router();

testResultsRouter.get("/test-results", async (_request, response) => {
  response.json(await getTestResults());
});
