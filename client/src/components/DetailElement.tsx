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

  const inputSx = {
    width: "100%",
    height: "100%",
    minWidth: 0,
    backgroundColor: "white",
    "& .MuiFormControl-root": { height: "100%" },
    "& .MuiOutlinedInput-root": {
      height: "100%",
      minHeight: 56,
      borderRadius: "0 8px 8px 0",
      backgroundColor: isChanged ? "#FFFBF3" : "white",
      boxShadow: isChanged
        ? "0 0 0 3px rgba(237, 108, 2, 0.12)"
        : "none",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: isChanged ? "warning.main" : "divider",
        borderWidth: isChanged ? 2 : 1,
      },
    },
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(115px, 0.7fr) minmax(0, 1.3fr)",
          md: "minmax(140px, 0.55fr) minmax(0, 1.45fr)",
        },
        alignItems: "stretch",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          minHeight: 56,
          border: isChanged ? "2px solid" : "1px solid",
          borderColor: isChanged ? "warning.main" : "divider",
          borderRadius: "8px 0 0 8px",
          px: 1.25,
          py: 0.75,
          backgroundColor: isChanged ? "#FFF4DE" : "grey.50",
          boxSizing: "border-box",
        }}
      >
        <Typography
          sx={{
            color: isChanged ? "warning.dark" : "text.primary",
            fontSize: "0.9rem",
            fontWeight: isChanged ? 700 : 400,
          }}
        >
          {name}
        </Typography>
      </Box>

      {typeof inputType === "string" ? (
        <TextField
          sx={inputSx}
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
          sx={inputSx}
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
