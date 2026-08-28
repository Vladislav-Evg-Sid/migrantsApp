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
  updateReference,
} from "../services/references";

interface ReferencesTableProps {
  tableName: RefTables;
  rerenderSignal?: boolean;
  rerenderDependencies?: () => void;
  height?: string;
}

function handleTableName(name: RefTables): string | undefined {
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
    case "area-responsibles":
      return "Контактные данные по МО";
    case "ppts":
      return "Контактные данные по ППТ";
  }
}

export default function ReferencesTable({
  tableName,
  rerenderSignal = false,
  rerenderDependencies = () => {},
  height = "45vh",
}: ReferencesTableProps) {
  const [table, setTable] = useState<TableData>({ head: [], body: [] });

  const getData = () => {
    const fetchTable = async () => {
      const tableData = await getReferenceTableData(tableName);
      setTable(tableData);
    };
    fetchTable();
  };

  useEffect(getData, [rerenderSignal]);

  const handleAddData = useCallback(
    async (data: TableCellData[]) => {
      await addReference(tableName, data);
      getData();
      rerenderDependencies();
    },
    [tableName],
  );

  const handleDeleteData = useCallback(
    async (id: TableCellData) => {
      await deleteReference(
        tableName,
        typeof id === "number" || typeof id === "string" ? id : id.code,
      );
      getData();
      rerenderDependencies();
    },
    [tableName],
  );

  const handleSaveChanges = useCallback(
    async (data: TableCellData[]) => {
      await updateReference(tableName, data);
      getData();
      rerenderDependencies();
    },
    [tableName],
  );

  return (
    <Box
      sx={{
        backgroundColor: "#D9D9D9",
        borderRadius: 10,
        p: 2,
        height: { height },
      }}
    >
      <Typography variant="h6" sx={{ color: "black" }}>
        {handleTableName(tableName)}
      </Typography>
      <DataTable
        head={table.head}
        body={table.body}
        hideIdCol={table.hideIdCol ? true : false}
        name={tableName}
        onAdd={handleAddData}
        onDelete={handleDeleteData}
        onSaveChanges={handleSaveChanges}
        reference
        width="100%"
      />
    </Box>
  );
}
