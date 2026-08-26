import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { ColumnTypes, ForeignKey } from "../types/tables";
import { updateTextFieldValue } from "../services/dataInput";

interface detailElementProps {
  name: string;
  data: string | number | undefined | ForeignKey;
  inputType: ColumnTypes;
  disabled?: boolean;
  isChanged: boolean;
  setIsChangedValue?: () => void;
}

export default function DetailElement({
  name,
  data,
  inputType,
  disabled,
  isChanged,
  setIsChangedValue = () => {},
}: detailElementProps) {
  const [userInput, setUserInput] = useState<String>("");

  useEffect(() => {
    setUserInput(
      data === null
        ? ""
        : String(typeof data === "object" ? data.code : (data ?? "")),
    );
  }, [data]);

  const handleValueChanged = (value: string) => {
    const strType = typeof inputType === "string" ? inputType : "string";
    let newValue = "";

    try {
      newValue = updateTextFieldValue(value, strType);
    } catch {
      return;
    }

    setIsChangedValue();

    setUserInput(newValue);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        width: "49%",
        m: "0.1%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          border: "solid",
          borderColor: isChanged ? "gray" : "black",
          width: "22%",
          p: "0.5%",
          backgroundColor: "white",
        }}
      >
        <Typography sx={{ color: "black" }}>{name}</Typography>
      </Box>
      {typeof inputType === "string" ? (
        <TextField
          sx={{
            width: "77%",
            backgroundColor: "white",
            height: "100%",
          }}
          disabled={disabled}
          value={
            inputType === "date"
              ? userInput.split(".").reverse().join("-")
              : userInput
          }
          onChange={(event) => handleValueChanged(event.target.value)}
          type={
            inputType === "phone"
              ? "tel"
              : inputType === "email"
                ? "email"
                : inputType === "date"
                  ? "date"
                  : "text"
          }
          inputMode={inputType === "number" ? "numeric" : "text"}
          slotProps={
            inputType === "date" ? { inputLabel: { shrink: true } } : undefined
          }
        />
      ) : (
        <Autocomplete
          sx={{
            width: "77%",
            backgroundColor: "white",
            height: "100%",
          }}
          disabled={disabled}
          options={inputType ?? [{ code: -1, name: "Ошибка" }]}
          getOptionLabel={(option) => option.name}
          value={
            (inputType ?? []).find(
              (variant) => String(variant.code) === userInput,
            ) ?? null
          }
          onChange={(_, newValue) => {
            handleValueChanged(String((newValue ?? { code: "" }).code) ?? "");
          }}
          renderInput={(params) => <TextField {...params} label="" />}
        />
      )}
    </Box>
  );
}
