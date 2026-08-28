import { useContext, useEffect, useState } from "react";
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { DeleteForever, Edit, More } from "@mui/icons-material";

import {
  type TableData,
  type TableCellData,
  type TableBodyRowData,
} from "../types/tables";
import InserterReferenceData from "./InserterReferenceData";
import { tableColumnHider } from "./utils/tableColumnHider";
import FilterRow from "./FilterRow";
import { useNavigate } from "react-router-dom";
import { ParticipantDataContext } from "../context/ParticipantContext";

interface DataTableProps extends TableData {
  name: string;
  width?: string | number;
  reference?: boolean;
  hideIdCol: boolean;
  onAdd?: (data: TableCellData[]) => void;
  onDelete?: (id: TableCellData) => void;
  onSaveChanges?: (data: TableCellData[]) => void;
  actionColumn?: "edit-delete" | "detail";
  navigateRoute?: string;
  fillAvailableHeight?: boolean;
}

export default function DataTable({
  head,
  body,
  hideIdCol,
  name,
  onAdd = (data: TableCellData[]) => {},
  onDelete = (id: TableCellData) => {},
  onSaveChanges = (data: TableCellData[]) => {},
  width = "100%",
  reference = false,
  actionColumn = "edit-delete",
  navigateRoute = "/",
  fillAvailableHeight = false,
}: DataTableProps) {
  const isCreatingParticipant =
    useContext(ParticipantDataContext)?.isCreating ?? false;
  const participantID =
    useContext(ParticipantDataContext)?.participantDetails.id ?? -1;

  const [editingData, setEditingData] = useState<string[] | null>(null);
  const [viewTable, setViewTable] = useState<TableBodyRowData[]>(body);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState<boolean>(false);
  const [identifierRow, setIdentifierRow] = useState<TableCellData[]>([]);

  useEffect(() => setViewTable(body), [body]);

  const navigate = useNavigate();

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
        cell2string(row[i] ?? "")
          .toLowerCase()
          .includes(filters[i]?.toLocaleLowerCase() ?? ""),
      );
    }
    setViewTable(intermediateFilteredData);
  };

  const getdDeleteAlert = (): string => {
    switch (name) {
      case "areas":
        return `округ с кодом ${identifierRow[0]}`;
      case "schools":
        return `школу с кодом ${identifierRow[0]}`;
      case "test-attempts":
        return `кратность участия "${identifierRow[1]}"`;
      case "participant-statuses":
        return `статус "${identifierRow[1]}"`;
      case "nations":
        return `национальность "${identifierRow[1]}"`;
      case "area-responsibles":
        return `контактные данные ответственного "${identifierRow[1]}" из округа "${typeof identifierRow[4] === "object" ? (identifierRow[4] ?? { name: "Неизвестный" }).name : identifierRow[4]}"`;
      case "ppts":
        return `контактные данные ответственного "${identifierRow[1]}" из ППТ ${identifierRow[0]}`;
      case "participants":
        return `участника с id ${identifierRow}`;
      case "exams":
        return `попытку экзамена номер ${identifierRow[1]} участника ${participantID}`;
    }
    return `Неизвестная таблица: ${name}`;
  };

  const isUndeleteable = isCreatingParticipant || editingData !== null;

  return (
    <>
      <Dialog
        open={deleteDialogIsOpen}
        onClose={() => setDeleteDialogIsOpen(false)}
      >
        <DialogTitle>Вы уверены?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите удалить {getdDeleteAlert()}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogIsOpen(false)} autoFocus>
            Закрыть
          </Button>
          <Button
            onClick={() => {
              onDelete(identifierRow[0] ?? -1);
              setDeleteDialogIsOpen(false);
            }}
          >
            Да
          </Button>
        </DialogActions>
      </Dialog>
      <TableContainer
        component={Paper}
        sx={{
          width,
          maxWidth: "100%",
          height: fillAvailableHeight ? "100%" : undefined,
          maxHeight: fillAvailableHeight ? "100%" : "93%",
          mb: fillAvailableHeight ? 0 : 4,
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
                      {(cell === null
                        ? ""
                        : typeof cell === "object"
                          ? cell.name
                          : typeof cell === "boolean"
                            ? cell
                              ? "Да"
                              : "Нет"
                            : cell) ?? "-"}
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
                  {actionColumn === "edit-delete" ? (
                    <>
                      <Button
                        onClick={() =>
                          setEditingData(
                            row.row.map((cell, index) =>
                              String(
                                cell === null
                                  ? ""
                                  : typeof cell === "object"
                                    ? cell.code
                                    : head[index]?.type === "boolean"
                                      ? cell
                                        ? "yes"
                                        : ""
                                      : cell,
                              ),
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
                        onClick={() => {
                          setIdentifierRow(row.row);
                          setDeleteDialogIsOpen(true);
                        }}
                        disabled={isUndeleteable}
                        sx={{
                          minWidth: "48px",
                        }}
                      >
                        <DeleteForever />
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => navigate(`${navigateRoute}/${row.row[0]}`)}
                      sx={{
                        minWidth: "48px",
                      }}
                    >
                      <More />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
