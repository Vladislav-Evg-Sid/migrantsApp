import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getParticipantDetails } from "../api/participants";
import { ArrowBack } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
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
        display: "flex",
        flexDirection: "column",
        height: "100svh",
        minWidth: 0,
        boxSizing: "border-box",
        overflow: "hidden",
        gap: { xs: 1.5, md: 2 },
        p: { xs: 1.5, sm: 2, md: 2.5 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <Button
          onClick={() => navigate("/participants")}
          variant="outlined"
          startIcon={<ArrowBack />}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          Назад
        </Button>
        <Typography
          variant="h5"
          component="h1"
          sx={{ fontWeight: 700, lineHeight: 1.2 }}
        >
          Карточка участника
        </Typography>
      </Box>
      <ParticipantDetails
        participant={participant}
        nationVariants={nationVariants}
        schoolVariants={schoolVariants}
      />
      <ParticipantExams table={participant.exams} />
    </Box>
  );
}
