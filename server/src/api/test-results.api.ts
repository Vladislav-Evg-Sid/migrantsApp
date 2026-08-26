import { Router } from "express";

import { createTestResult } from "../services/test-results.service.js";

export const testResultsRouter = Router();

testResultsRouter.post("/test-results", async (request, response) => {
  await createTestResult(request.body);
  response.status(201).send();
});
