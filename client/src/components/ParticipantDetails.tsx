import { Box, Button } from "@mui/material";
import DetailElement from "./DetailElement";
import type { ParticipantData } from "../types/participants";

interface participantDetailsProps {
  participant: Omit<ParticipantData, "exams">;
  isCreating?: boolean;
}

export default function ParticipantDetails({
  participant,
  isCreating,
}: participantDetailsProps) {
  return (
    <Box
      sx={{
        backgroundColor: "#D9D9D9",
        borderRadius: 10,
        p: 2,
        height: "28vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        <DetailElement name="ID" data={participant.id} disabled={!isCreating} />
        <DetailElement name="Национальность" data={participant.nation} />
        <DetailElement name="Фамилия" data={participant.surname} />
        <DetailElement name="Школа обучения" data={participant.school} />
        <DetailElement name="Имя" data={participant.name} />
        <DetailElement
          name="Дата следующего экзамена"
          data={participant.nextExamDate}
        />
        <DetailElement name="Отчество" data={participant.patronymic} />
        <DetailElement name="Комментарий" data={participant.schoolComment} />
        <DetailElement name="Дата рождения" data={participant.birthDate} />
        <DetailElement name="Примечание РЦОИ" data={participant.rcoiNote} />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "end",
        }}
      >
        <Button
          variant="contained"
          sx={{
            mt: "0.2%",
            mr: "1.7%",
          }}
        >
          Сохранить
        </Button>
      </Box>
    </Box>
  );
}
