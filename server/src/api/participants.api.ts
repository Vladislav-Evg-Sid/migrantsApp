import { Router } from "express";

import {
  createParticipant,
  deleteParticipant,
  getParticipantDetails,
  getParticipantExams,
  getParticipants,
  updateParticipant,
} from "../services/participants.service.js";

export const participantsRouter = Router();

participantsRouter.get("/participants", async (_request, response) => {
  response.json(await getParticipants());
});

participantsRouter.post("/participants", async (request, response) => {
  const createdParticipant = await createParticipant(request.body);
  response.status(201).json(createdParticipant);
});

participantsRouter.get("/participants/:id/test-results", async (request, response) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    response.status(400).json({
      error: "INVALID_PARTICIPANT_ID",
      message: "Некорректный ID участника",
    });
    return;
  }

  const exams = await getParticipantExams(id);
  if (!exams) {
    response.status(404).json({
      error: "PARTICIPANT_NOT_FOUND",
      message: "Участник не найден",
    });
    return;
  }

  response.json(exams);
});

participantsRouter.put("/participants/:id", async (request, response) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    response.status(400).json({
      error: "INVALID_PARTICIPANT_ID",
      message: "Некорректный ID участника",
    });
    return;
  }

  if (!(await updateParticipant(id, request.body))) {
    response.status(404).json({
      error: "PARTICIPANT_NOT_FOUND",
      message: "Участник не найден",
    });
    return;
  }

  response.status(204).send();
});

participantsRouter.delete("/participants/:id", async (request, response) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    response.status(400).json({
      error: "INVALID_PARTICIPANT_ID",
      message: "Некорректный ID участника",
    });
    return;
  }

  if (!(await deleteParticipant(id))) {
    response.status(404).json({
      error: "PARTICIPANT_NOT_FOUND",
      message: "Участник не найден",
    });
    return;
  }

  response.status(204).send();
});

participantsRouter.get("/participants/:id", async (request, response) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) {
    response.status(400).json({
      error: "INVALID_PARTICIPANT_ID",
      message: "Некорректный ID участника",
    });
    return;
  }

  const participant = await getParticipantDetails(id);
  if (!participant) {
    response.status(404).json({
      error: "PARTICIPANT_NOT_FOUND",
      message: "Участник не найден",
    });
    return;
  }

  response.json(participant);
});
