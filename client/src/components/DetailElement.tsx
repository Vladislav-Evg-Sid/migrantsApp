import { Box, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { ForeignKey } from "../types/tables";

interface detailElementProps {
  name: string;
  data: string | number | undefined | ForeignKey;
  disabled?: boolean;
}

export default function DetailElement({
  name,
  data,
  disabled,
}: detailElementProps) {
  const [userInput, setUserInput] = useState<String>("");

  useEffect(() => {
    setUserInput(
      data === null
        ? ""
        : typeof data === "object"
          ? data.name
          : String(data ?? ""),
    );
  }, [data]);

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
          borderColor: "black",
          width: "22%",
          p: "0.5%",
          backgroundColor: "white",
        }}
      >
        <Typography sx={{ color: "black" }}>{name}</Typography>
      </Box>
      <TextField
        sx={{
          width: "77%",
          backgroundColor: "white",
          height: "100%",
        }}
        disabled={disabled}
        value={userInput}
        // onChange={(event) => setValue(index, event.target.value)}
        // type={
        //   type === "phone" ? "tel" : type === "email" ? "email" : "text"
        // }
        // inputMode={
        // type === "number" || type === "phone"
        // ? "numeric"
        // : type === "email"
        // ? "email"
        // : "text"
        // }
        // slotProps={
        // type === "phone"
        // ? { htmlInput: { maxLength: 11, pattern: "[0-9]{11}" } }
        // : type === "email"
        // ? { htmlInput: { maxLength: 127 } }
        // : undefined
        // }
        // fullWidth
        // disabled={index === 0 && editMode}
      />
    </Box>
  );
}
