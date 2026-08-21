import { Router } from "express";

import {
  createArea,
  createAreaResponsible,
  createNation,
  createParticipantStatus,
  createPpt,
  createSchool,
  createTestAttempt,
  createTestDate,
  getAreaResponsibles,
  getAreas,
  getNations,
  getParticipantStatuses,
  getPpts,
  getSchools,
  getTestAttempts,
  getTestDates,
} from "../services/reference-data.service.js";

export const referenceDataRouter = Router();

referenceDataRouter.get("/areas", async (_request, response) => {
  response.json(await getAreas());
});

referenceDataRouter.post("/areas", async (request, response) => {
  await createArea(request.body);
  response.status(201).send();
});

referenceDataRouter.get("/schools", async (_request, response) => {
  response.json(await getSchools());
});

referenceDataRouter.post("/schools", async (request, response) => {
  await createSchool(request.body);
  response.status(201).send();
});

referenceDataRouter.get("/ppts", async (_request, response) => {
  response.json(await getPpts());
});

referenceDataRouter.post("/ppts", async (request, response) => {
  await createPpt(request.body);
  response.status(201).send();
});

referenceDataRouter.get("/area-responsibles", async (_request, response) => {
  response.json(await getAreaResponsibles());
});

referenceDataRouter.post("/area-responsibles", async (request, response) => {
  await createAreaResponsible(request.body);
  response.status(201).send();
});

referenceDataRouter.get("/nations", async (_request, response) => {
  response.json(await getNations());
});

referenceDataRouter.post("/nations", async (request, response) => {
  await createNation(request.body);
  response.status(201).send();
});

referenceDataRouter.get("/participant-statuses", async (_request, response) => {
  response.json(await getParticipantStatuses());
});

referenceDataRouter.post("/participant-statuses", async (request, response) => {
  await createParticipantStatus(request.body);
  response.status(201).send();
});

referenceDataRouter.get("/test-dates", async (_request, response) => {
  response.json(await getTestDates());
});

referenceDataRouter.post("/test-dates", async (request, response) => {
  await createTestDate(request.body);
  response.status(201).send();
});

referenceDataRouter.get("/test-attempts", async (_request, response) => {
  response.json(await getTestAttempts());
});

referenceDataRouter.post("/test-attempts", async (request, response) => {
  await createTestAttempt(request.body);
  response.status(201).send();
});
