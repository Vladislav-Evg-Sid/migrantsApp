import { Box, Paper, Typography } from "@mui/material";
import DataTable from "./DataTable";
import type { TableData } from "../types/tables";
import { memo, useMemo } from "react";

interface ParticipantExamsProps {
  table: TableData;
  isCreating: boolean;
}

function ParticipantExams({ table, isCreating }: ParticipantExamsProps) {
  const visibleTable = useMemo<TableData>(
    () => ({
      head: table.head.filter((_, index) => index < 9 || index > 10),
      body: table.body.map(({ row }) => ({
        row: row.filter((_, index) => index < 9 || index > 10),
      })),
    }),
    [table],
  );

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
          head={visibleTable.head}
          body={isCreating ? [] : visibleTable.body}
          hideIdCol
          fillAvailableHeight
          reference
        />
      </Box>
    </Paper>
  );
}

export default memo(ParticipantExams);
