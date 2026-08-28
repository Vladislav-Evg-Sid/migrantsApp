import { Box, Button, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import type { TableData } from "../types/tables";
import { Bounce, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowBack } from "@mui/icons-material";
import { getPptByDate } from "../api/exams";

export default function ExamPptsPage() {
  const { dateId } = useParams();
  const [ppts, setPpts] = useState<TableData>({
    body: [],
    head: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchfilters = async () =>
      setPpts(await getPptByDate(Number(dateId)));
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
        onClick={() => navigate("/exams")}
        variant="contained"
        startIcon={<ArrowBack />}
        sx={{ borderRadius: 2, textTransform: "none", alignSelf: "start" }}
      >
        Назад
      </Button>
      <Typography variant="h4" sx={{ color: "black" }}>
        Выберете ППТ
      </Typography>
      <Box
        sx={{
          backgroundColor: "#D9D9D9",
          borderRadius: 10,
          p: 2,
          height: "90%",
          mb: 1,
        }}
      >
        <DataTable
          body={ppts.body}
          head={ppts.head}
          hideIdCol={false}
          name="ppts"
          actionColumn="detail"
          fillAvailableHeight
          navigateRoute={`/exams/${dateId}/ppt/`}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
        }}
      ></Box>
    </Box>
  );
}
