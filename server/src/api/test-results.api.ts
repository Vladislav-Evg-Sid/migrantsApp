import { Router } from "express";

import {
  createTestResult,
  deleteTestResult,
  getOtherParticipantsByPptAndTestDate,
  getParticipantsByPptAndTestDate,
  getPptsByTestDateId,
  getTestResultHead,
  updateTestResult,
} from "../services/test-results.service.js";

export const testResultsRouter = Router();

testResultsRouter.get("/test-results/dates/:testDateId/ppts", async (request, response) => {
  const testDateId = Number(request.params.testDateId);
  if (!Number.isSafeInteger(testDateId) || testDateId <= 0) {
    response.status(400).json({
      error: "INVALID_TEST_DATE_ID",
      message: "Некорректный ID даты экзамена",
    });
    return;
  }

  const ppts = await getPptsByTestDateId(testDateId);
  if (!ppts) {
    response.status(404).json({
      error: "TEST_DATE_NOT_FOUND",
      message: "Дата экзамена не найдена",
    });
    return;
  }

  response.json(ppts);
});

testResultsRouter.get(
  "/test-results/dates/:testDateId/ppts/:pptCode/participants",
  async (request, response) => {
    const testDateId = Number(request.params.testDateId);
    const pptCode = Number(request.params.pptCode);
    if (
      !Number.isSafeInteger(testDateId) ||
      testDateId <= 0 ||
      !Number.isSafeInteger(pptCode) ||
      pptCode <= 0
    ) {
      response.status(400).json({
        error: "INVALID_TEST_DATE_OR_PPT_CODE",
        message: "Некорректный ID даты экзамена или код ППТ",
      });
      return;
    }

    const participants = await getParticipantsByPptAndTestDate(pptCode, testDateId);
    if (!participants) {
      response.status(404).json({
        error: "TEST_DATE_OR_PPT_NOT_FOUND",
        message: "Дата экзамена или ППТ не найдены",
      });
      return;
    }

    response.json(participants);
  },
);

testResultsRouter.get(
  "/test-results/dates/:testDateId/ppts/:pptCode/other-participants",
  async (request, response) => {
    const testDateId = Number(request.params.testDateId);
    const pptCode = Number(request.params.pptCode);
    if (
      !Number.isSafeInteger(testDateId) ||
      testDateId <= 0 ||
      !Number.isSafeInteger(pptCode) ||
      pptCode <= 0
    ) {
      response.status(400).json({
        error: "INVALID_TEST_DATE_OR_PPT_CODE",
        message: "Некорректный ID даты экзамена или код ППТ",
      });
      return;
    }

    const participants = await getOtherParticipantsByPptAndTestDate(pptCode, testDateId);
    if (!participants) {
      response.status(404).json({
        error: "TEST_DATE_OR_PPT_NOT_FOUND",
        message: "Дата экзамена или ППТ не найдены",
      });
      return;
    }

    response.json(participants);
  },
);

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

testResultsRouter.delete("/test-results/:id", async (request, response) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    response.status(400).json({
      error: "INVALID_TEST_RESULT_ID",
      message: "Некорректный ID экзамена",
    });
    return;
  }

  if (!(await deleteTestResult(id))) {
    response.status(404).json({
      error: "TEST_RESULT_NOT_FOUND",
      message: "Экзамен не найден",
    });
    return;
  }

  response.status(204).send();
});
