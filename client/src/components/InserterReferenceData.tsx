import { useEffect, useState } from "react";
import {
  TableRow,
  TableCell,
  TextField,
  Button,
  Autocomplete,
} from "@mui/material";
import { Bounce, toast } from "react-toastify";

import { type ColumnTypes, type TableCellData } from "../types/tables";
import { tableColumnHider } from "./utils/tableColumnHider";

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
  const [values, setValues] = useState<string[]>(Array(types.length).fill(""));

  const editMode = editingData !== null && editingData.length === types.length;
  useEffect(() => {
    if (editMode) {
      setValues(editingData);
      return;
    }
    setValues(Array(types.length).fill(""));
  }, [types.length, editingData]);

  const setValue = (ind: number, value: string) => {
    if (typeof types[ind] === "string") {
      if (types[ind] === "number") {
        if (!/^-?\d*$/.test(value)) {
          return;
        }
      }
    }
    setValues((prev) => {
      const newValues = [...prev];
      newValues[ind] = value;
      return newValues;
    });
  };

  const handleAdd = () => {
    const newData: TableCellData[] = [];
    for (const index in values) {
      const curVal = values[index];
      if (curVal === undefined || curVal === "") {
        if (index === "0" && hideIdCol && editingData === null) {
          continue;
        }
        toast.error("Все данные должны быть заполнены", {
          position: "top-right",
          autoClose: 5000,
          theme: "light",
          transition: Bounce,
        });
        return;
      }
      newData.push(values[index] ?? "");
    }
    onAdd(newData);
    setValues(Array(types.length).fill(""));
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
              <TextField
                value={values[index] ?? ""}
                onChange={(event) => setValue(index, event.target.value)}
                inputMode={type === "number" ? "numeric" : "text"}
                fullWidth
                disabled={index === 0 && editMode}
              />
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
          {editMode ? "Сохранить" : "Добавить"}
        </Button>
      </TableCell>
    </TableRow>
  );
}
