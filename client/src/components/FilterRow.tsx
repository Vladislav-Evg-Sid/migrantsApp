import { useEffect, useState } from "react";
import { Button, TableCell, TableRow, TextField } from "@mui/material";
import { FilterAlt, FilterAltOff } from "@mui/icons-material";

import type { ColumnTypes } from "../types/tables";
import { tableColumnHider } from "./utils/tableColumnHider";

interface FilterRowProps {
  filters: ColumnTypes[];
  hideIdCol: boolean;
  onFilter: (filters: string[]) => void;
}

export default function FilterRow({
  filters,
  hideIdCol,
  onFilter,
}: FilterRowProps) {
  const [values, setValues] = useState<string[]>(
    Array(filters.length).fill(""),
  );

  useEffect(() => {
    setValues(Array(filters.length).fill(""));
  }, [filters.length]);

  const setValue = (ind: number, value: string) => {
    if (typeof filters[ind] === "string") {
      if (filters[ind] === "number") {
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

  const handleClearFilters = () => {
    const emptyFilters = Array(filters.length).fill("");
    setValues(emptyFilters);
    onFilter(emptyFilters);
  };

  return (
    <TableRow
      sx={{
        "&:nth-of-type(even)": {
          backgroundColor: "#FAFBFC",
        },
      }}
    >
      {filters.map((filter, index) =>
        tableColumnHider(
          index,
          hideIdCol,
          <TableCell
            key={index}
            align="center"
            sx={{
              border: `1px solid #000000`,
              lineHeight: 1.4,
              verticalAlign: "top",
              whiteSpace: "normal",
              overflowWrap: "anywhere",
            }}
          >
            <TextField
              value={values[index] ?? ""}
              onChange={(event) => setValue(index, event.target.value)}
              inputMode={
                typeof filter === "string" && filter === "number"
                  ? "numeric"
                  : "text"
              }
              fullWidth
            />
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
          onClick={() => onFilter(values)}
          sx={{ minWidth: "48px", m: 0.5 }}
        >
          <FilterAlt />
        </Button>
        <Button onClick={handleClearFilters} sx={{ minWidth: "48px", m: 0.5 }}>
          <FilterAltOff />
        </Button>
      </TableCell>
    </TableRow>
  );
}
