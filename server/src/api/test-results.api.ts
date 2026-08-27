import { Router } from "express";

import {
  createTestResult,
  getTestResultHead,
  updateTestResult,
} from "../services/test-results.service.js";

export const testResultsRouter = Router();

testResultsRouter.get("/test-results/head", async (_request, response) => {
  response.json(await getTestResultHead());
});

testResultsRouter.post("/test-results", async (request, response) => {
  await createTestResult(request.body);
  response.status(201).send();
});

testResultsRouter.put("/test-results/:id", async (request, response) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    response.status(400).json({
      error: "INVALID_TEST_RESULT_ID",
      message: "Некорректный ID экзамена",
    });
    return;
  }

  if (!(await updateTestResult(id, request.body))) {
    response.status(404).json({
      error: "TEST_RESULT_NOT_FOUND",
      message: "Экзамен не найден",
    });
    return;
  }

  response.status(204).send();
});
