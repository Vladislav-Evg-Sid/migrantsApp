import { Box, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

import DataTable from "./DataTable";
import {
  type TableData,
  type RefTables,
  type TableCellData,
} from "../types/tables";
import { getReferenceTableData } from "../services/references";
import {
  addReference,
  deleteReference,
  saveChanges,
} from "../services/references";

interface ReferencesTableProps {
  tableName: RefTables;
}

function handleTableName(name: RefTables): string {
  switch (name) {
    case "areas":
      return "Округа";
    case "schools":
      return "Школы";
    case "test-attempts":
      return "Кратность участия в тестировании";
    case "participant-statuses":
      return "Статусы участников";
    case "nations":
      return "Национальности";
  }
}

export default function ReferencesTable({ tableName }: ReferencesTableProps) {
  const [table, setTable] = useState<TableData>({ head: [], body: [] });

  const getData = () => {
    const fetchTable = async () => {
      const tableData = await getReferenceTableData(tableName);
      setTable(tableData);
    };
    fetchTable();
  };

  useEffect(getData, []);

  const handleAddData = useCallback(
    async (data: TableCellData[]) => {
      await addReference(tableName, data);
      setTable({ head: [], body: [] }); // TODO Удалить после появления бэка
      getData();
    },
    [tableName],
  );

  const handleDeleteData = useCallback(
    async (id: TableCellData) => {
      await deleteReference(
        tableName,
        typeof id === "number" || typeof id === "string" ? id : id.code,
      );
      setTable({ head: [], body: [] }); // TODO Удалить после появления бэка
      getData();
    },
    [tableName],
  );

  const handleSaveChanges = useCallback(
    async (data: TableCellData[]) => {
      await saveChanges(tableName, data);
      setTable({ head: [], body: [] }); // TODO Удалить после появления бэка
      getData();
    },
    [tableName],
  );

  return (
    <Box
      sx={{
        backgroundColor: "#D9D9D9",
        borderRadius: 10,
        p: 2,
        height: "40vh",
      }}
    >
      <Typography variant="h6" sx={{ color: "black" }}>
        {handleTableName(tableName)}
      </Typography>
      <DataTable
        head={table.head}
        body={table.body}
        onAdd={handleAddData}
        onDelete={handleDeleteData}
        onSaveChanges={handleSaveChanges}
        reference
        width="100%"
      />
    </Box>
  );
}
