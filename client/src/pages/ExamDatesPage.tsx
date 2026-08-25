import { Container, Typography } from "@mui/material";
import ExamDateList from "../components/ExamDateList";

export default function ExamDatePage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 3,
        }}
      >
        Даты экзаменов
      </Typography>
      <ExamDateList />
    </Container>
  );
}
