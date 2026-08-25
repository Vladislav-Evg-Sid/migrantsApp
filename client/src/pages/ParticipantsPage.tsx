import { Box, Button } from "@mui/material";
import FilterRow from "../components/FilterRow";
import { useEffect, useState } from "react";
import { type CellFilter } from "../types/filters";
import DataTable from "../components/DataTable";
import type { TableData } from "../types/tables";
import { getParticipants } from "../api/participants";
import { Bounce, ToastContainer } from "react-toastify";

export default function ParticipantsPage() {
  const [participantsData, setParticipantsData] = useState<TableData>({
    body: [],
    head: [],
  });

  useEffect(() => {
    const fetchfilters = async () =>
      setParticipantsData(await getParticipants());
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
          body={participantsData.body}
          head={participantsData.head}
          hideIdCol={false}
          name="participants"
          actionColumn="detail"
        />
      </Box>
      <Button
        onClick={() => alert("Пока функция не готова")}
        variant="contained"
        color="success"
        sx={{ textTransform: "none" }}
      >
        Загрузить из Excel
      </Button>
    </Box>
  );
}
