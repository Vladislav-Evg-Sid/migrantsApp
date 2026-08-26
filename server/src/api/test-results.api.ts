import { Router } from "express";

import {
  createTestResult,
  getTestResultCreationHead,
} from "../services/test-results.service.js";

export const testResultsRouter = Router();

testResultsRouter.get("/test-results/head", async (_request, response) => {
  response.json(await getTestResultCreationHead());
});

testResultsRouter.post("/test-results", async (request, response) => {
  await createTestResult(request.body);
  response.status(201).send();
});
