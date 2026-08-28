import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getExamTableHead,
  getParticipantDetails,
  getParticipantExams,
} from "../api/participants";
import { ArrowBack } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import ParticipantDetails from "../components/ParticipantDetails";
import { type ParticipantData } from "../types/participants";
import ParticipantExams from "../components/ParticipantExams";
import { type ForeignKey, type TableBodyRowData } from "../types/tables";
import { getReferenceTable } from "../api/references";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { ParticipantDataContext } from "../context/ParticipantContext";

export default function ParticipantDetailsPage() {
  const { id } = useParams();
  const [participant, setParticipant] = useState<ParticipantData>({
    id: 0,
    surname: "",
    name: "",
    birthDate: "",
    nation: { code: -1, name: "" },
    exams: { head: [], body: [] },
  });
  const [schoolVariants, setSchoolVariants] = useState<ForeignKey[]>([]);
  const [nationVariants, setNationVariants] = useState<ForeignKey[]>([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const resetStateAfterCreate = useRef<() => void>(() => {});

  const navigate = useNavigate();

  const participantID = Number(id);
  useEffect(() => {
    if (participantID === -1) {
      setIsCreating(true);
      const fetchParticipantExamHead = async () => {
        const newHead = await getExamTableHead();
        setParticipant((prev) => ({
          ...prev,
          exams: {
            ...prev.exams,
            head: newHead,
          },
        }));
      };
      fetchParticipantExamHead();
    } else {
      const handeParticipantDetails = async () =>
        setParticipant(await getParticipantDetails(participantID));
      setIsCreating(false);
      handeParticipantDetails();
    }
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

  useEffect(() => {
    if (participantID === -1) {
      toast.info(
        "Заполните данные участника, добавьте первый экзамен и создайте участника",
        {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          transition: Bounce,
        },
      );
    }
  }, []);

  const refrashParticipantExams = () => {
    const fetchParticipantExams = async () => {
      const participantExams = await getParticipantExams(participantID);
      setParticipant((prev) => ({
        ...prev,
        exams: participantExams,
      }));
    };
    fetchParticipantExams();
  };

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
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop={false}
        closeOnClick
        theme="light"
        transition={Bounce}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <Button
          onClick={() => navigate(-1)}
          variant="contained"
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
      <ParticipantDataContext
        value={{
          isCreating: isCreating,
          participantDetails: {
            ...participant,
            birthDate: participant.birthDate.includes(".")
              ? participant.birthDate.split(".").reverse().join("-")
              : participant.birthDate,
          },
          participantFirstExam: participant.exams.body[0] ?? { row: [] },
          setParticipantDetails: (
            participantDetails: Omit<ParticipantData, "exams">,
          ) => {
            setParticipant((prev) => ({
              ...participantDetails,
              exams: prev.exams,
            }));
          },
          setParticipantDetailElement: (
            inputName: keyof Omit<ParticipantData, "exams">,
            newValue: string | ForeignKey,
          ) => {
            setParticipant((prev) => ({
              ...prev,
              [inputName]: newValue,
            }));
          },
          setParticipantFirstExam: (participantFirstExam: TableBodyRowData) => {
            setParticipant((prev) => ({
              ...prev,
              exams: {
                ...prev.exams,
                body: [participantFirstExam],
              },
            }));
          },
          resetStateAfterCreate: resetStateAfterCreate.current,
          addResetStateAfterCreate: (callback: () => void) => {
            resetStateAfterCreate.current = callback;
          },
        }}
      >
        <ParticipantDetails
          nationVariants={nationVariants}
          schoolVariants={schoolVariants}
        />
        <ParticipantExams
          participantID={participantID}
          table={participant.exams}
          isCreating={isCreating}
          rerenderTrigger={refrashParticipantExams}
        />
      </ParticipantDataContext>
    </Box>
  );
}
