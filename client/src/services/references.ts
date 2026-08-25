import {
  type TableCellData,
  type RefTables,
  type TableData,
} from "../types/tables";
import {
  addReferenceTableData,
  deleteReferenceTableData,
  getReferenceTable,
  updateReferenceTableData,
} from "../api/references";

export async function addReference(name: RefTables, data: TableCellData[]) {
  switch (name) {
    case "areas":
      if (data[0] === undefined || data[1] === undefined) {
        throw new Error("No data input");
      }
      await addReferenceTableData(name, {
        code: +data[0],
        name: String(data[1]),
      });
      break;
    case "schools":
      if (
        data[0] === undefined ||
        data[1] === undefined ||
        data[2] === undefined ||
        data[3] === undefined
      ) {
        throw new Error("No data input");
      }
      await addReferenceTableData(name, {
        code: +data[0],
        name: String(data[1]),
        address: String(data[2]),
        areaCode: +data[3],
      });
      break;
    case "test-attempts":
      if (data[0] === undefined || data[1] === undefined) {
        throw new Error("No data input");
      }
      await addReferenceTableData(name, {
        number: +data[0],
        name: String(data[1]),
      });
      break;
    case "participant-statuses":
      if (data[0] === undefined) {
        throw new Error("No data input");
      }
      await addReferenceTableData(name, {
        name: String(data[0]),
      });
      break;
    case "nations":
      if (data[0] === undefined) {
        throw new Error("No data input");
      }
      await addReferenceTableData(name, {
        name: String(data[0]),
      });
      break;
    case "area-responsibles":
      if (
        data[0] === undefined ||
        data[1] === undefined ||
        data[2] === undefined ||
        data[3] === undefined
      ) {
        throw new Error("No data input");
      }
      await addReferenceTableData(name, {
        areaCode: +data[3],
        name: String(data[0]),
        phone: String(data[1]),
        mail: String(data[2]),
      });
      break;
    case "ppts":
      if (
        data[0] === undefined ||
        data[1] === undefined ||
        data[2] === undefined ||
        data[3] === undefined
      ) {
        throw new Error("No data input");
      }
      await addReferenceTableData(name, {
        code: +data[0],
        schoolCode: +data[3],
        responsiblePhone: String(data[2]),
        responsibleName: String(data[1]),
      });
      break;
  }
}

export async function deleteReference(name: RefTables, id: number | string) {
  await deleteReferenceTableData(name, id);
}

export async function updateReference(name: RefTables, data: TableCellData[]) {
  switch (name) {
    case "areas":
      if (data[0] === undefined || data[1] === undefined) {
        throw new Error("No data input");
      }
      await updateReferenceTableData(name, +data[0], {
        name: String(data[1]),
      });
      break;
    case "schools":
      if (
        data[0] === undefined ||
        data[1] === undefined ||
        data[2] === undefined ||
        data[3] === undefined
      ) {
        throw new Error("No data input");
      }
      await updateReferenceTableData(name, +data[0], {
        name: String(data[1]),
        address: String(data[2]),
        areaCode: +data[3],
      });
      break;
    case "test-attempts":
      if (data[0] === undefined || data[1] === undefined) {
        throw new Error("No data input");
      }
      await updateReferenceTableData(name, +data[0], {
        name: String(data[1]),
      });
      break;
    case "participant-statuses":
      if (data[0] === undefined) {
        throw new Error("No data input");
      }
      await updateReferenceTableData(name, +data[0], {
        name: String(data[1]),
      });
      break;
    case "nations":
      if (data[0] === undefined) {
        throw new Error("No data input");
      }
      await updateReferenceTableData(name, +data[0], {
        name: String(data[1]),
      });
      break;
    case "area-responsibles":
      if (
        data[0] === undefined ||
        data[1] === undefined ||
        data[2] === undefined ||
        data[3] === undefined ||
        data[4] === undefined
      ) {
        throw new Error("No data input");
      }
      await updateReferenceTableData(name, +data[0], {
        areaCode: +data[4],
        name: String(data[1]),
        phone: String(data[2]),
        mail: String(data[3]),
      });
      break;
    case "ppts":
      if (
        data[0] === undefined ||
        data[1] === undefined ||
        data[2] === undefined ||
        data[3] === undefined
      ) {
        throw new Error("No data input");
      }
      await updateReferenceTableData(name, +data[0], {
        schoolCode: +data[3],
        responsiblePhone: String(data[2]),
        responsibleName: String(data[1]),
      });
      break;
  }
}

export async function getReferenceTableData(
  tableName: RefTables,
): Promise<TableData> {
  const tableData = await getReferenceTable(tableName);
  if (
    ["participant-statuses", "nations", "area-responsibles"].includes(tableName)
  ) {
    tableData.hideIdCol = true;
  }
  return tableData;
}
