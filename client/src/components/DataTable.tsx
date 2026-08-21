import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Box,
} from "@mui/material";
import { DeleteForever, Edit } from "@mui/icons-material";

import { type TableData, type TableCellData } from "../types/tables";
import InserterReferenceData from "./InserterReferenceData";
import { useState } from "react";

interface DataTableProps extends TableData {
  width?: string | number;
  reference?: boolean;
  onAdd?: (data: TableCellData[]) => void;
  onDelete?: (id: TableCellData) => void;
  onSaveChanges?: (data: TableCellData[]) => void;
}

export default function DataTable({
  head,
  body,
  onAdd = (data: TableCellData[]) => {},
  onDelete = (id: TableCellData) => {},
  onSaveChanges = (data: TableCellData[]) => {},
  width = "100%",
  reference = false,
}: DataTableProps) {
  const [editingData, setEditingData] = useState<string[] | null>(null);

  const handleSaveData = (data: TableCellData[]) => {
    if (editingData === null) {
      onAdd(data);
      return;
    }
    onSaveChanges(data);
    setEditingData(null);
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        width,
        maxWidth: "100%",
        maxHeight: "90%",
        mb: 4,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <Table size="small" sx={{ width: "100%", tableLayout: "fixed" }}>
        <TableHead>
          <TableRow key="header-row">
            {head.map(({ cell }) => (
              <TableCell
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
                {typeof cell === "number" || typeof cell === "string"
                  ? cell
                  : cell.name}
              </TableCell>
            ))}
            <TableCell
              key={`header-add`}
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
              Действие
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reference ? (
            <InserterReferenceData
              types={head.map(({ type }) => type)}
              onAdd={handleSaveData}
              editedData={editingData}
            />
          ) : null}
          {body.map((row) => (
            <TableRow
              key={`row-${row.row[0]}`}
              sx={{
                "&:nth-of-type(even)": {
                  backgroundColor: "#FAFBFC",
                },
              }}
            >
              {row.row.map((cell, index) => (
                <TableCell
                  key={`body-cell-${row.row[0]}-${index}`}
                  align={index === 0 ? "left" : "center"}
                  sx={{
                    border: `1px solid #000000`,
                    lineHeight: 1.4,
                    verticalAlign: "top",
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                  }}
                >
                  {(typeof cell === "number" || typeof cell === "string"
                    ? cell
                    : cell.name) ?? "-"}
                </TableCell>
              ))}
              <TableCell
                key={`body-cell-${row.row[0]}-add`}
                align="center"
                sx={{
                  border: `1px solid #000000`,
                  lineHeight: 1.4,
                  verticalAlign: "top",
                  whiteSpace: "normal",
                  overflowWrap: "anywhere",
                }}
              >
                <Button
                  onClick={() =>
                    setEditingData(row.row.map((cell) => String(cell)))
                  }
                  sx={{
                    minWidth: "48px",
                  }}
                >
                  <Edit />
                </Button>
                <Button
                  onClick={() => onDelete(row.row[0] ?? -1)}
                  sx={{
                    minWidth: "48px",
                  }}
                >
                  <DeleteForever />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
