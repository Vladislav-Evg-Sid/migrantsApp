import { Box } from "@mui/material";
import DataTable from "./DataTable";
import type { TableData } from "../types/tables";

interface ParticipantExamsProps {
  table: TableData;
}

export default function ParticipantExams({ table }: ParticipantExamsProps) {
  return (
    <Box
      sx={{
        backgroundColor: "#D9D9D9",
        borderRadius: 10,
        p: 2,
        mt: "0.2%",
        height: "60vh",
      }}
    >
      <DataTable
        name="Результаты"
        head={table.head}
        body={table.body}
        hideIdCol={false}
      />
    </Box>
  );
}
