import { Router } from "express";

import {
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

referenceDataRouter.get("/schools", async (_request, response) => {
  response.json(await getSchools());
});

referenceDataRouter.get("/ppts", async (_request, response) => {
  response.json(await getPpts());
});

referenceDataRouter.get("/area-responsibles", async (_request, response) => {
  response.json(await getAreaResponsibles());
});

referenceDataRouter.get("/nations", async (_request, response) => {
  response.json(await getNations());
});

referenceDataRouter.get("/participant-statuses", async (_request, response) => {
  response.json(await getParticipantStatuses());
});

referenceDataRouter.get("/test-dates", async (_request, response) => {
  response.json(await getTestDates());
});

referenceDataRouter.get("/test-attempts", async (_request, response) => {
  response.json(await getTestAttempts());
});
