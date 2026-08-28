import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import type { TableData } from "../types/tables";
import { Bounce, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import {
  getCurrentExamOtherParticipants,
  getCurrentExamParticipants,
} from "../api/exams";

export default function ExamParticipantsPage() {
  const { dateId, pptId } = useParams();
  const [examParticipants, setExamParticipants] = useState<TableData>({
    body: [],
    head: [],
  });
  const [examOtherParticipants, setExamOtherParticipants] = useState<TableData>(
    {
      body: [],
      head: [],
    },
  );

  const navigate = useNavigate();

  useEffect(() => {
    const fetchfilters = async () => {
      setExamParticipants(
        await getCurrentExamParticipants(Number(dateId), Number(pptId)),
      );
      setExamOtherParticipants(
        await getCurrentExamOtherParticipants(Number(dateId), Number(pptId)),
      );
    };
    fetchfilters();
  }, []);

  return (
    <Box
      sx={{
        width: "auto",
        height: "98vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "0.5%",
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
      <Button
        onClick={() => navigate(`/exams/${dateId}`)}
        variant="contained"
        startIcon={<ArrowBack />}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          alignSelf: "start",
          mb: 1,
        }}
      >
        Назад
      </Button>
      <Box
        sx={{
          backgroundColor: "#D9D9D9",
          borderRadius: 10,
          p: 2,
          height: "45%",
          mb: 1,
        }}
      >
        <Typography variant="h5" sx={{ color: "black" }}>
          Зарегестрированные участники
        </Typography>
        <DataTable
          body={examParticipants.body}
          head={examParticipants.head}
          hideIdCol={false}
          name="participants"
          actionColumn="detail"
          navigateRoute="/participants/details"
        />
      </Box>
      <Box
        sx={{
          backgroundColor: "#D9D9D9",
          borderRadius: 10,
          p: 2,
          height: "45%",
          mb: 1,
        }}
      >
        <Typography variant="h5" sx={{ color: "black" }}>
          Незарегестрированные участники
        </Typography>
        <DataTable
          body={examOtherParticipants.body}
          head={examOtherParticipants.head}
          hideIdCol={false}
          name="participants"
          actionColumn="detail"
          navigateRoute="/participants/details"
        />
      </Box>
    </Box>
  );
}
