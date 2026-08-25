import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getParticipantDetails } from "../api/participants";
import { Box, Button } from "@mui/material";
import ParticipantDetails from "../components/ParticipantDetails";
import { type ParticipantData } from "../types/participants";
import ParticipantExams from "../components/ParticipantExams";

export default function ParticipantDetailsPage() {
  const { id } = useParams();
  const [participant, setParticipant] = useState<ParticipantData>({
    id: 0,
    surname: "",
    firstname: "",
    birthday: "",
    nation: { code: 0, name: "" },
    exams: { head: [], body: [] },
  });
  const navigate = useNavigate();

  const participantID = Number(id);
  useEffect(() => {
    const handeParticipantDetails = async () =>
      setParticipant(await getParticipantDetails(participantID));
    handeParticipantDetails();
  }, [id]);

  return (
    <Box
      sx={{
        m: "0.5%",
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <Button
        onClick={() => navigate("/participants")}
        variant="contained"
        sx={{ m: "0.2%", width: "90px" }}
      >
        Назад
      </Button>
      <ParticipantDetails participant={participant} />
      <ParticipantExams table={participant.exams} />
    </Box>
  );
}
