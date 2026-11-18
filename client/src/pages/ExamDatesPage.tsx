import { Box, Container, Typography } from "@mui/material";
import { useState } from "react";
import ExamDateList from "../components/ExamDateList";
import AddExamDatesDialog from "../components/AddExamDatesDialog";

export default function ExamDatePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Даты экзаменов
        </Typography>
        <AddExamDatesDialog onDatesAdded={() => setRefreshKey((key) => key + 1)} />
      </Box>
      <ExamDateList refreshKey={refreshKey} />
    </Container>
  );
}
