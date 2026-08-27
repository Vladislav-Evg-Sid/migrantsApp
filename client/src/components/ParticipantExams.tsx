import { Box, Paper, Typography } from "@mui/material";
import DataTable from "./DataTable";
import type { TableCellData, TableData } from "../types/tables";
import { memo, useMemo } from "react";
import { createParticipantExam } from "../api/participants";
import { parseExamResult } from "../services/dataInput";

interface ParticipantExamsProps {
  participantID: number;
  table: TableData;
  isCreating: boolean;
  rerenderTrigger: () => void;
}

function ParticipantExams({
  table,
  isCreating,
  participantID,
  rerenderTrigger,
}: ParticipantExamsProps) {
  const visibleTable = useMemo<TableData>(
    () => ({
      head: table.head.filter((_, index) => index < 9 || index > 11),
      body: table.body.map(({ row }) => ({
        row: row.filter((_, index) => index < 9 || index > 11),
      })),
    }),
    [table],
  );

  const handleAddExam = (data: TableCellData[]) => {
    const fetchAddExam = async () => {
      await createParticipantExam({
        participantId: participantID,
        isSpecialCategory: Boolean(data[7]),
        statusId: Number(data[6]),
        testDateId: Number(data[1]),
        result: parseExamResult(String(data[5])),
        class: Number(data[4]),
        sendingSchoolCode: Number(data[2]),
        testAttemptNumber: Number(data[0]),
        appealId: null,
        testingCenterPptCode: Number(data[3]),
      });
      rerenderTrigger();
    };
    fetchAddExam();
  };

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
          onAdd={handleAddExam}
        />
      </Box>
    </Paper>
  );
}

export default memo(ParticipantExams);
