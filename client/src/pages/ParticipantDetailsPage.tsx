import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getParticipantDetails } from "../api/participants";
import { Box, Button } from "@mui/material";
import ParticipantDetails from "../components/ParticipantDetails";
import { type ParticipantData } from "../types/participants";
import ParticipantExams from "../components/ParticipantExams";
import { type ForeignKey } from "../types/tables";
import { getReferenceTable } from "../api/references";

export default function ParticipantDetailsPage() {
  const { id } = useParams();
  const [participant, setParticipant] = useState<ParticipantData>({
    id: 0,
    surname: "",
    name: "",
    birthDate: "",
    nation: { code: 0, name: "" },
    exams: { head: [], body: [] },
  });
  const [schoolVariants, setSchoolVariants] = useState<ForeignKey[]>([]);
  const [nationVariants, setNationVariants] = useState<ForeignKey[]>([]);

  const navigate = useNavigate();

  const participantID = Number(id);
  useEffect(() => {
    const handeParticipantDetails = async () =>
      setParticipant(await getParticipantDetails(participantID));
    handeParticipantDetails();
  }, [id]);

  useEffect(() => {
    const fetchSchools = async () => {
      const schools = await getReferenceTable("schools");
      setSchoolVariants(
        schools.body.map(({ row }) => ({
          code: Number(row[0] ?? -1),
          name: String(row[1] ?? ""),
        })),
      );
    };
    const fetchNations = async () => {
      const schools = await getReferenceTable("nations");
      setNationVariants(
        schools.body.map(({ row }) => ({
          code: Number(row[0] ?? -1),
          name: String(row[1] ?? ""),
        })),
      );
    };
    fetchSchools();
    fetchNations();
  }, []);

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
      <ParticipantDetails
        participant={participant}
        nationVariants={nationVariants}
        schoolVariants={schoolVariants}
      />
      <ParticipantExams table={participant.exams} />
    </Box>
  );
}
