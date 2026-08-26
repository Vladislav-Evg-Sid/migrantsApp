import { Box, Button, Paper, Typography } from "@mui/material";
import DetailElement from "./DetailElement";
import type { ParticipantData } from "../types/participants";
import { useState } from "react";
import type { ForeignKey } from "../types/tables";

interface participantDetailsProps {
  participant: Omit<ParticipantData, "exams">;
  nationVariants: ForeignKey[];
  schoolVariants: ForeignKey[];
  isCreating?: boolean;
}

interface ChangedInputs {
  id: boolean;
  surname: boolean;
  name: boolean;
  patronymic: boolean;
  birthDate: boolean;
  nation: boolean;
  school: boolean;
  nextExamDate: boolean;
  schoolComment: boolean;
  rcoiNote: boolean;
}

export default function ParticipantDetails({
  participant,
  nationVariants,
  schoolVariants,
  isCreating,
}: participantDetailsProps) {
  const [changedInputs, setChangedInputs] = useState<ChangedInputs>({
    id: false,
    surname: false,
    name: false,
    patronymic: false,
    birthDate: false,
    nation: false,
    school: false,
    nextExamDate: false,
    schoolComment: false,
    rcoiNote: false,
  });

  const setChangedInputStatus = (inputName: keyof ChangedInputs) => {
    setChangedInputs((prev) => ({
      ...prev,
      [inputName]: true,
    }));
  };

  return (
    <Paper
      elevation={2}
      sx={{
        backgroundColor: "#D9D9D9",
        borderRadius: 3,
        p: { xs: 1.5, md: 2 },
        flexShrink: 0,
      }}
    >
      <Typography variant="h6" component="h2" sx={{ mb: 1.5, fontWeight: 700 }}>
        Основная информация
      </Typography>
      <Box
        sx={{
          backgroundColor: "#D9D9D9",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
          gap: 1,
        }}
      >
        <DetailElement
          name="ID"
          data={participant.id}
          inputType="number"
          isChanged={changedInputs.id}
          disabled={!isCreating}
          setIsChangedValue={() => {
            setChangedInputStatus("id");
          }}
        />
        <DetailElement
          name="Национальность"
          inputType={nationVariants}
          isChanged={changedInputs.nation}
          data={participant.nation}
          setIsChangedValue={() => {
            setChangedInputStatus("nation");
          }}
        />
        <DetailElement
          name="Фамилия"
          data={participant.surname}
          inputType="string"
          isChanged={changedInputs.surname}
          setIsChangedValue={() => {
            setChangedInputStatus("surname");
          }}
        />
        <DetailElement
          name="Школа обучения"
          data={participant.school}
          inputType={schoolVariants}
          isChanged={changedInputs.school}
          setIsChangedValue={() => {
            setChangedInputStatus("school");
          }}
        />
        <DetailElement
          name="Имя"
          data={participant.name}
          inputType="string"
          isChanged={changedInputs.name}
          setIsChangedValue={() => {
            setChangedInputStatus("name");
          }}
        />
        <DetailElement
          name="Дата следующего экзамена"
          data={participant.nextExamDate}
          inputType="date"
          isChanged={changedInputs.nextExamDate}
          setIsChangedValue={() => {
            setChangedInputStatus("nextExamDate");
          }}
        />
        <DetailElement
          name="Отчество"
          data={participant.patronymic}
          inputType="string"
          isChanged={changedInputs.patronymic}
          setIsChangedValue={() => {
            setChangedInputStatus("patronymic");
          }}
        />
        <DetailElement
          name="Комментарий"
          data={participant.schoolComment}
          inputType="string"
          isChanged={changedInputs.schoolComment}
          setIsChangedValue={() => {
            setChangedInputStatus("schoolComment");
          }}
        />
        <DetailElement
          name="Дата рождения"
          data={participant.birthDate}
          inputType="date"
          isChanged={changedInputs.birthDate}
          setIsChangedValue={() => {
            setChangedInputStatus("birthDate");
          }}
        />
        <DetailElement
          name="Примечание РЦОИ"
          data={participant.rcoiNote}
          inputType="string"
          isChanged={changedInputs.rcoiNote}
          setIsChangedValue={() => {
            setChangedInputStatus("rcoiNote");
          }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 1.5,
        }}
      >
        <Button
          variant="contained"
          sx={{
            minWidth: 120,
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Сохранить
        </Button>
      </Box>
    </Paper>
  );
}
