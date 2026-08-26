import { Box, Paper, Typography } from "@mui/material";
import DataTable from "./DataTable";
import type { TableData } from "../types/tables";

interface ParticipantExamsProps {
  table: TableData;
}

export default function ParticipantExams({ table }: ParticipantExamsProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        backgroundColor: "#D9D9D9",
        borderRadius: 3,
        p: { xs: 1.5, md: 2 },
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h6"
        component="h2"
        sx={{ mb: 1.5, fontWeight: 700, flexShrink: 0 }}
      >
        Экзамены участника
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataTable
          name="Результаты"
          head={table.head}
          body={table.body}
          hideIdCol={false}
          fillAvailableHeight
        />
      </Box>
    </Paper>
  );
}
