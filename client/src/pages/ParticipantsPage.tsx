import { Box, Button } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import type { TableBodyRowData, TableData } from "../types/tables";
import { downloadParticipants, getParticipants } from "../api/participants";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function ParticipantsPage() {
  const [participantsData, setParticipantsData] = useState<TableData>({
    body: [],
    head: [],
  });

  const [visibleRows, setVisibleRows] = useState<TableBodyRowData[]>([]);
  const handleVisibleRowsChange = useCallback((rows: TableBodyRowData[]) => setVisibleRows(rows), []);
  const navigate = useNavigate();

  const downloadTable = async () => {
    try {
      await downloadParticipants(visibleRows.map(({ row }) => Number(row[0])));
    } catch {
      toast.error("Не удалось скачать таблицу участников");
    }
  };

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
          onVisibleRowsChange={handleVisibleRowsChange}
          head={participantsData.head}
          hideIdCol={false}
          name="participants"
          actionColumn="detail"
          fillAvailableHeight
          navigateRoute="/participants/details"
        />
      </Box>
      <Box
        sx={{
          display: "flex",
        }}
      >
        <Button
          onClick={downloadTable}
          disabled={!participantsData.head.length}
          variant="contained"
          color="success"
          sx={{ textTransform: "none", mr: 1 }}
        >
          Скачать таблицу
        </Button>
        <Button
          onClick={() => alert("Пока функция не готова")}
          variant="contained"
          color="success"
          sx={{ textTransform: "none", mr: 1 }}
        >
          Загрузить из Excel
        </Button>
        <Button
          onClick={() => navigate("/participants/details/-1")}
          variant="contained"
          color="success"
          sx={{ textTransform: "none" }}
        >
          Добавить
        </Button>
      </Box>
    </Box>
  );
}
