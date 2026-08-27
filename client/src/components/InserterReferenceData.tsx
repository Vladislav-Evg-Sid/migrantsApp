import { act, useContext, useEffect, useReducer, useState } from "react";
import {
  TableRow,
  TableCell,
  TextField,
  Button,
  Autocomplete,
  Checkbox,
} from "@mui/material";
import { Bounce, toast } from "react-toastify";

import {
  type ColumnTypes,
  type TableBodyRowData,
  type TableCellData,
} from "../types/tables";
import { tableColumnHider } from "./utils/tableColumnHider";
import { updateTextFieldValue } from "../services/dataInput";
import {
  ParticipantDataContext,
  type ParticipantDataContextInterface,
} from "../context/ParticipantContext";

function parseParticipantContext(
  participantDataContext: ParticipantDataContextInterface | null,
): Pick<
  ParticipantDataContextInterface,
  | "isCreating"
  | "participantFirstExam"
  | "setParticipantFirstExam"
  | "addResetStateAfterCreate"
> {
  if (participantDataContext === null) {
    return {
      isCreating: false,
      participantFirstExam: { row: [] },
      setParticipantFirstExam: (participantFirstExam: TableBodyRowData) => {},
      addResetStateAfterCreate: (callback: () => void) => {},
    };
  } else {
    return {
      isCreating: participantDataContext.isCreating,
      participantFirstExam: participantDataContext.participantFirstExam,
      setParticipantFirstExam: participantDataContext.setParticipantFirstExam,
      addResetStateAfterCreate: participantDataContext.addResetStateAfterCreate,
    };
  }
}

function checkInsertValue(
  curVal: string | undefined,
  isNullableCol: boolean,
  type: ColumnTypes | undefined,
): "good" | "return" | "continue" {
  if (curVal === undefined || curVal === "") {
    if (isNullableCol) {
      return "continue";
    }
    if (type === "boolean") {
      return "good";
    }

    toast.error("Все данные должны быть заполнены", {
      position: "top-right",
      autoClose: 5000,
      theme: "light",
      transition: Bounce,
    });
    return "return";
  }
  if (type === "phone" && !/^\d{11}$/.test(curVal ?? "")) {
    toast.error("Телефон должен содержать ровно 11 цифр", {
      position: "top-right",
      autoClose: 5000,
      theme: "light",
      transition: Bounce,
    });
    return "return";
  }
  if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(curVal ?? "")) {
    toast.error("Введите корректный адрес электронной почты", {
      position: "top-right",
      autoClose: 5000,
      theme: "light",
      transition: Bounce,
    });
    return "return";
  }
  return "good";
}

function reduceButtonText(
  currentText: "Добавить" | "Сохранить" | "Сохранено" | "Изменить",
  action: "update" | "save-upd" | "context-change" | "context-save" | "reset",
) {
  if (action === "reset") {
    return "Добавить";
  }
  switch (currentText) {
    case "Добавить":
      if (action === "update") {
        return "Сохранить";
      }
      if (action === "context-save") {
        return "Сохранено";
      }
      break;
    case "Сохранить":
      if (action === "save-upd") {
        return "Добавить";
      }
      break;
    case "Сохранено":
      if (action === "context-change") {
        return "Изменить";
      }
      break;
    case "Изменить":
      if (action === "context-save") {
        return "Сохранено";
      }
      break;
  }
  return currentText;
}

interface InserterProps {
  hideIdCol: boolean;
  types: ColumnTypes[];
  onAdd: (data: TableCellData[]) => void;
  editedData: string[] | null;
}

export default function InserterReferenceData({
  types,
  onAdd,
  editedData: editingData,
  hideIdCol,
}: InserterProps) {
  const participantExamsContext = parseParticipantContext(
    useContext(ParticipantDataContext),
  );

  const [values, setValues] = useState<string[]>(Array(types.length).fill(""));
  const [buttonText, dispatchButtonText] = useReducer(
    reduceButtonText,
    "Добавить",
  );

  const editMode = editingData !== null && editingData.length === types.length;
  useEffect(() => {
    if (editMode) {
      dispatchButtonText("update");
      setValues(editingData);
      return;
    }
    setValues(Array(types.length).fill(""));
  }, [types.length, editingData]);

  const setValue = (ind: number, value: string) => {
    const type = typeof types[ind] === "string" ? types[ind] : "string";
    let newValue = "";

    try {
      newValue = updateTextFieldValue(value, type);
    } catch {
      return;
    }
    setValues((prev) => {
      const newValues = [...prev];
      newValues[ind] = newValue;
      return newValues;
    });
    dispatchButtonText("context-change");
  };

  const handleAdd = () => {
    const newData: TableCellData[] = [];
    for (const index in values) {
      const curVal = values[index];
      switch (
        checkInsertValue(
          curVal,
          index === "0" && hideIdCol && editingData === null,
          types[index],
        )
      ) {
        case "return":
          return;
        case "continue":
          continue;
        case "good":
          break;
      }
      newData.push((values[index] ?? "").trim().replace(/\s+/g, " "));
    }
    if (participantExamsContext.isCreating) {
      participantExamsContext.addResetStateAfterCreate(() => {
        dispatchButtonText("reset");
        setValues(Array(types.length).fill(""));
      });
      dispatchButtonText("context-save");
      if (editingData === null) {
        newData.unshift(-1);
      }
      participantExamsContext.setParticipantFirstExam({
        row: newData,
      });
    } else {
      dispatchButtonText("save-upd");
      onAdd(newData);
      setValues(Array(types.length).fill(""));
    }
  };

  return (
    <TableRow key="header-row">
      {types.map((type, index) =>
        tableColumnHider(
          index,
          hideIdCol,
          <TableCell
            key={`inserter-${index}`}
            align="center"
            sx={{
              border: `1px solid #000000`,
              fontWeight: 600,
              lineHeight: 1.35,
              textAlign: "center",
              verticalAlign: "middle",
              whiteSpace: "normal",
              overflowWrap: "anywhere",
            }}
          >
            {typeof type === "string" ? (
              type === "boolean" ? (
                <Checkbox
                  checked={values[index] ? true : false}
                  onChange={(event) =>
                    setValue(index, event.target.checked ? "Yes" : "")
                  }
                />
              ) : (
                <TextField
                  value={values[index] ?? ""}
                  onChange={(event) => setValue(index, event.target.value)}
                  type={
                    type === "phone"
                      ? "tel"
                      : type === "email"
                        ? "email"
                        : "text"
                  }
                  inputMode={
                    type === "number" || type === "phone"
                      ? "numeric"
                      : type === "email"
                        ? "email"
                        : "text"
                  }
                  slotProps={
                    type === "phone"
                      ? { htmlInput: { maxLength: 11, pattern: "[0-9]{11}" } }
                      : type === "email"
                        ? { htmlInput: { maxLength: 127 } }
                        : undefined
                  }
                  fullWidth
                  disabled={index === 0 && editMode}
                />
              )
            ) : (
              <Autocomplete
                fullWidth
                options={type ?? [{ code: -1, name: "Ошибка" }]}
                getOptionLabel={(option) => option.name}
                value={
                  (type ?? []).find(
                    (variant) => String(variant.code) === values[index],
                  ) ?? null
                }
                onChange={(_, newValue) => {
                  setValue(
                    index,
                    String((newValue ?? { code: "" }).code) ?? "",
                  );
                }}
                renderInput={(params) => <TextField {...params} label="" />}
              />
            )}
          </TableCell>,
        ),
      )}
      <TableCell
        key={`inserter-add`}
        align="center"
        sx={{
          border: `1px solid #000000`,
          fontWeight: 600,
          lineHeight: 1.35,
          textAlign: "center",
          verticalAlign: "middle",
          whiteSpace: "normal",
          overflowWrap: "anywhere",
        }}
      >
        <Button
          onClick={handleAdd}
          variant="contained"
          color="success"
          sx={{ textTransform: "none" }}
        >
          {buttonText}
        </Button>
      </TableCell>
    </TableRow>
  );
}
