import { Box, Button, Paper, Typography } from "@mui/material";
import DetailElement from "./DetailElement";
import type { ParticipantData } from "../types/participants";
import { useContext, useEffect, useState } from "react";
import type { ForeignKey } from "../types/tables";
import { ParticipantDataContext } from "../context/ParticipantContext";
import { Bounce, toast } from "react-toastify";
import { createParticipant } from "../api/participants";
import { useNavigate } from "react-router-dom";
import { parseExamResult } from "../services/dataInput";

interface participantDetailsProps {
  nationVariants: ForeignKey[];
  schoolVariants: ForeignKey[];
}

interface ChangedInputs {
  id: "error" | "saved" | "changed";
  surname: "error" | "saved" | "changed";
  name: "error" | "saved" | "changed";
  patronymic: "error" | "saved" | "changed";
  birthDate: "error" | "saved" | "changed";
  nation: "error" | "saved" | "changed";
  school: "error" | "saved" | "changed";
  nextExamDate: "error" | "saved" | "changed";
  schoolComment: "error" | "saved" | "changed";
  rcoiNote: "error" | "saved" | "changed";
}

const defaultInputStates: ChangedInputs = {
  id: "saved",
  surname: "saved",
  name: "saved",
  patronymic: "saved",
  birthDate: "saved",
  nation: "saved",
  school: "saved",
  nextExamDate: "saved",
  schoolComment: "saved",
  rcoiNote: "saved",
};

export default function ParticipantDetails({
  nationVariants,
  schoolVariants,
}: participantDetailsProps) {
  const participantContext = useContext(ParticipantDataContext);
  if (participantContext === null) {
    throw Error("Undefined participant context");
  }

  const navigate = useNavigate();

  const [changedInputs, setChangedInputs] =
    useState<ChangedInputs>(defaultInputStates);

  const handleChangeParticipantData = (
    inputName: keyof Omit<ParticipantData, "exams">,
    newValue: string | ForeignKey,
  ) => {
    participantContext.setParticipantDetailElement(inputName, newValue);
    setChangedInputs((prev) => {
      if (prev[inputName] === "changed") {
        return prev;
      }

      return {
        ...prev,
        [inputName]: "changed",
      };
    });
  };

  const handleSaveParticipant = () => {
    const hasSurnameError =
      participantContext.participantDetails.surname === "";
    const hasNameError = participantContext.participantDetails.name === "";
    const hasBirthDateError =
      participantContext.participantDetails.birthDate === "";
    const hasNationError =
      participantContext.participantDetails.nation.code === -1;

    if (
      hasSurnameError ||
      hasNameError ||
      hasBirthDateError ||
      hasNationError
    ) {
      setChangedInputs((prev) => ({
        ...prev,
        surname: hasSurnameError ? "error" : prev.surname,
        name: hasNameError ? "error" : prev.name,
        birthDate: hasBirthDateError ? "error" : prev.birthDate,
        nation: hasNationError ? "error" : prev.nation,
      }));
      toast.error("Все обязательные поля должны быть заполненны", {
        position: "top-right",
        autoClose: 5000,
        theme: "light",
        transition: Bounce,
      });
      return;
    }

    if (participantContext.isCreating) {
      if (participantContext.participantFirstExam.row.length == 0) {
        toast.error("Необходимо добавить экзамен", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          transition: Bounce,
        });
        return;
      }
    }

    const fetchCreateParticipant = async () => {
      const participantID = await createParticipant({
        surname: participantContext.participantDetails.surname
          .trim()
          .replace(/\s+/g, " "),
        name: participantContext.participantDetails.name
          .trim()
          .replace(/\s+/g, " "),
        patronymic:
          participantContext.participantDetails.patronymic
            ?.trim()
            .replace(/\s+/g, " ") ?? null,
        birthDay: Number(
          participantContext.participantDetails.birthDate.split("-")[2],
        ),
        birthMonth: Number(
          participantContext.participantDetails.birthDate.split("-")[1],
        ),
        birthYear: Number(
          participantContext.participantDetails.birthDate.split("-")[0],
        ),
        nationId: participantContext.participantDetails.nation.code,
        confirmedSchoolCode:
          participantContext.participantDetails.school?.code ?? null,
        nextPlannedDate:
          participantContext.participantDetails.nextExamDate ?? null,
        comment: participantContext.participantDetails.schoolComment ?? null,
        rcoiNote: participantContext.participantDetails.rcoiNote ?? null,
        firstExam: {
          isSpecialCategory: participantContext.participantFirstExam.row[8]
            ? true
            : false,
          statusId: Number(participantContext.participantFirstExam.row[7]),
          testDateId: Number(participantContext.participantFirstExam.row[2]),
          result: parseExamResult(
            String(participantContext.participantFirstExam.row[6]),
          ),
          class: Number(participantContext.participantFirstExam.row[5]),
          sendingSchoolCode: Number(
            participantContext.participantFirstExam.row[3],
          ),
          testAttemptNumber: Number(
            participantContext.participantFirstExam.row[1],
          ),
          appealId: null,
          testingCenterPptCode: Number(
            participantContext.participantFirstExam.row[4],
          ),
        },
      });

      navigate(`/participants/details/${participantID}`);
    };

    fetchCreateParticipant();
    setChangedInputs(defaultInputStates);
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
          data={participantContext.participantDetails.id}
          inputType="number"
          inputState={changedInputs.id}
          disabled
          onChange={(newValue) => {
            handleChangeParticipantData("id", newValue);
          }}
        />
        <DetailElement
          name="Национальность*"
          inputType={nationVariants}
          inputState={changedInputs.nation}
          data={participantContext.participantDetails.nation}
          onChange={(newValue) => {
            handleChangeParticipantData("nation", newValue);
          }}
        />
        <DetailElement
          name="Фамилия*"
          data={participantContext.participantDetails.surname}
          inputType="string"
          inputState={changedInputs.surname}
          onChange={(newValue) => {
            handleChangeParticipantData("surname", newValue);
          }}
        />
        <DetailElement
          name="Школа обучения"
          data={participantContext.participantDetails.school}
          inputType={schoolVariants}
          inputState={changedInputs.school}
          onChange={(newValue) => {
            handleChangeParticipantData("school", newValue);
          }}
        />
        <DetailElement
          name="Имя*"
          data={participantContext.participantDetails.name}
          inputType="string"
          inputState={changedInputs.name}
          onChange={(newValue) => {
            handleChangeParticipantData("name", newValue);
          }}
        />
        <DetailElement
          name="Дата следующего экзамена"
          data={participantContext.participantDetails.nextExamDate}
          inputType="date"
          inputState={changedInputs.nextExamDate}
          onChange={(newValue) => {
            handleChangeParticipantData("nextExamDate", newValue);
          }}
        />
        <DetailElement
          name="Отчество"
          data={participantContext.participantDetails.patronymic}
          inputType="string"
          inputState={changedInputs.patronymic}
          onChange={(newValue) => {
            handleChangeParticipantData("patronymic", newValue);
          }}
        />
        <DetailElement
          name="Комментарий"
          data={participantContext.participantDetails.schoolComment}
          inputType="string"
          inputState={changedInputs.schoolComment}
          onChange={(newValue) => {
            handleChangeParticipantData("schoolComment", newValue);
          }}
        />
        <DetailElement
          name="Дата рождения*"
          data={participantContext.participantDetails.birthDate}
          inputType="date"
          inputState={changedInputs.birthDate}
          onChange={(newValue) => {
            handleChangeParticipantData("birthDate", newValue);
          }}
        />
        <DetailElement
          name="Примечание РЦОИ"
          data={participantContext.participantDetails.rcoiNote}
          inputType="string"
          inputState={changedInputs.rcoiNote}
          onChange={(newValue) => {
            handleChangeParticipantData("rcoiNote", newValue);
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
          onClick={handleSaveParticipant}
          sx={{
            minWidth: 120,
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          {participantContext.isCreating ? "Создать" : "Сохранить"}
        </Button>
      </Box>
    </Paper>
  );
}
