import { useEffect, useState } from "react";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";
import { DeleteForever, Edit } from "@mui/icons-material";

import {
  type TableData,
  type TableCellData,
  type TableBodyRowData,
} from "../types/tables";
import InserterReferenceData from "./InserterReferenceData";
import { tableColumnHider } from "./utils/tableColumnHider";
import FilterRow from "./FilterRow";

interface DataTableProps extends TableData {
  width?: string | number;
  reference?: boolean;
  hideIdCol: boolean;
  onAdd?: (data: TableCellData[]) => void;
  onDelete?: (id: TableCellData) => void;
  onSaveChanges?: (data: TableCellData[]) => void;
}

export default function DataTable({
  head,
  body,
  hideIdCol,
  onAdd = (data: TableCellData[]) => {},
  onDelete = (id: TableCellData) => {},
  onSaveChanges = (data: TableCellData[]) => {},
  width = "100%",
  reference = false,
}: DataTableProps) {
  const [editingData, setEditingData] = useState<string[] | null>(null);
  const [viewTable, setViewTable] = useState<TableBodyRowData[]>(body);

  useEffect(() => setViewTable(body), [body]);

  const handleSaveData = (data: TableCellData[]) => {
    if (editingData === null) {
      onAdd(data);
      return;
    }
    onSaveChanges(data);
    setEditingData(null);
  };

  const handleFilterData = (filters: string[]) => {
    const cell2string = (cell: TableCellData): string => {
      if (typeof cell === "object") {
        return cell.name;
      }
      return String(cell);
    };
    let intermediateFilteredData = [...body];
    for (let i = 0; i < filters.length; i++) {
      intermediateFilteredData = intermediateFilteredData.filter(({ row }) =>
        cell2string(row[i] ?? "").includes(filters[i] ?? ""),
      );
    }
    setViewTable(intermediateFilteredData);
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        width,
        maxWidth: "100%",
        maxHeight: "93%",
        mb: 4,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <Table size="small" sx={{ width: "100%", tableLayout: "fixed" }}>
        <TableHead>
          <FilterRow
            hideIdCol={hideIdCol}
            filters={head.map(({ type }) => type)}
            onFilter={handleFilterData}
          />
          <TableRow key="header-row">
            {head.map(({ cell }, index) =>
              tableColumnHider(
                index,
                hideIdCol,
                <TableCell
                  key={index}
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
                </TableCell>,
              ),
            )}
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
              hideIdCol={hideIdCol}
              types={head.map(({ type }) => type)}
              onAdd={handleSaveData}
              editedData={editingData}
            />
          ) : null}
          {viewTable.map((row) => (
            <TableRow
              key={`row-${row.row[0]}`}
              sx={{
                "&:nth-of-type(even)": {
                  backgroundColor: "#FAFBFC",
                },
              }}
            >
              {row.row.map((cell, index) =>
                tableColumnHider(
                  index,
                  hideIdCol,
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
                  </TableCell>,
                ),
              )}
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
                    setEditingData(
                      row.row.map((cell) =>
                        String(typeof cell === "object" ? cell.code : cell),
                      ),
                    )
                  }
                  sx={{
                    minWidth: "48px",
                  }}
                >
                  <Edit />
                </Button>
                <Button
                  onClick={() => onDelete(row.row[0] ?? -1)}
                  disabled={editingData !== null}
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
