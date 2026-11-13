import { Router } from "express";
import { exportParticipants } from "../services/participants-export.service.js";

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

participantsRouter.post("/participants/export", async (request, response) => {
  const ids: unknown = request.body?.ids;
  if (!Array.isArray(ids) || ids.length > 100_000 ||
      !ids.every(id => Number.isSafeInteger(id) && id > 0)) {
    response.status(400).json({ message: "Некорректный список участников" });
    return;
  }
  try {
    const workbook = await exportParticipants(ids as number[]);
    response.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''%D0%A3%D1%87%D0%B0%D1%81%D1%82%D0%BD%D0%B8%D0%BA%D0%B8.xlsx");
    response.setHeader("Cache-Control", "no-store");
    response.send(workbook);
  } catch (error) {
    console.error("Participant export:", error);
    response.status(500).json({ message: "Не удалось сформировать таблицу участников" });
  }
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
