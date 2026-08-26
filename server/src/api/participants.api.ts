import { Router } from "express";

import {
  createParticipant,
  getParticipantDetails,
  getParticipants,
} from "../services/participants.service.js";

export const participantsRouter = Router();

participantsRouter.get("/participants", async (_request, response) => {
  response.json(await getParticipants());
});

participantsRouter.post("/participants", async (request, response) => {
  const createdParticipant = await createParticipant(request.body);
  response.status(201).json(createdParticipant);
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
