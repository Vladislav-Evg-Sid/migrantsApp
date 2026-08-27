import { Autocomplete, Box, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { ColumnTypes, ForeignKey } from "../types/tables";

interface detailElementProps {
  name: string;
  data: string | number | undefined | ForeignKey;
  inputType: ColumnTypes;
  disabled?: boolean;
  inputState: "error" | "saved" | "changed";
  onChange: (newValue: string | ForeignKey) => void;
}

export default function DetailElement({
  name,
  data,
  inputType,
  disabled,
  inputState,
  onChange,
}: detailElementProps) {
  const [userInput, setUserInput] = useState<String>("");

  useEffect(() => {
    setUserInput(
      data === null
        ? ""
        : String(typeof data === "object" ? data.code : (data ?? "")),
    );
  }, [data]);

  const isChanged = inputState === "changed";
  const isError = inputState === "error";
  const borderColor = isError
    ? "error.main"
    : isChanged
      ? "warning.main"
      : "divider";
  const textColor = isError
    ? "error.dark"
    : isChanged
      ? "warning.dark"
      : "text.primary";
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
      backgroundColor: isError ? "#FFF8F8" : isChanged ? "#FFFBF3" : "white",
      boxShadow: isError
        ? "0 0 0 3px rgba(211, 47, 47, 0.12)"
        : isChanged
          ? "0 0 0 3px rgba(237, 108, 2, 0.12)"
          : "none",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor,
        borderWidth: inputState === "saved" ? 1 : 2,
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
          border: inputState === "saved" ? "1px solid" : "2px solid",
          borderColor,
          borderRadius: "8px 0 0 8px",
          px: 1.25,
          py: 0.75,
          backgroundColor: isError
            ? "#FDECEC"
            : isChanged
              ? "#FFF4DE"
              : "grey.50",
          boxSizing: "border-box",
        }}
      >
        <Typography
          sx={{
            color: textColor,
            fontSize: "0.9rem",
            fontWeight: inputState === "saved" ? 400 : 700,
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
          onChange={(event) => onChange(event.target.value)}
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
            onChange({
              code: Number(newValue?.code),
              name: String(newValue?.name),
            });
          }}
          renderInput={(params) => <TextField {...params} label="" />}
        />
      )}
    </Box>
  );
}
