import { Router } from "express";

import { getParticipants } from "../services/participants.service.js";

export const participantsRouter = Router();

participantsRouter.get("/participants", async (_request, response) => {
  response.json(await getParticipants());
});
