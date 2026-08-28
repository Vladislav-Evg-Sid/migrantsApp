import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import type { TableData } from "../types/tables";
import { getParticipants } from "../api/participants";
import { Bounce, ToastContainer } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { getReferenceTable } from "../api/references";

export default function ExamPptsPage() {
  const { dateId } = useParams();
  const [ppts, setPpts] = useState<TableData>({
    body: [],
    head: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchfilters = async () => setPpts(await getReferenceTable("ppts"));
    fetchfilters();
  }, []);

  return (
    <Box
      sx={{
        width: "auto",
        height: "98vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "end",
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
      <Box
        sx={{
          backgroundColor: "#D9D9D9",
          borderRadius: 10,
          p: 2,
          height: "93%",
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
