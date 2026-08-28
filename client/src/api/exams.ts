import { Bounce, toast } from "react-toastify";
import { baseApi } from "../env";
import { type DateId, type ExamDate, type Month } from "../types/exams";
import type { TableCellData } from "../types/tables";
import type { UpdateTestResultInput } from "../types/dto";

type ExamDataResponse = [number, [Month, DateId[]][]];

export async function getExamDates(): Promise<ExamDate> {
  const response = await fetch(`${baseApi}/test-dates`);
  if (!response.ok) {
    toast.error("Не удалось загрузить данные участника", {
      position: "top-right",
      autoClose: 5000,
      theme: "light",
      transition: Bounce,
    });
    throw new Error(`${response.status}`);
  }
  const data: ExamDataResponse[] = await response.json();
  console.log(data);

  return new Map(data.map(([year, month]) => [year, new Map(month)]));
}

export async function deleteExam(id: TableCellData) {
  const response = await fetch(`${baseApi}/test-results/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    toast.error("Не удалось удалить попытку теста", {
      position: "top-right",
      autoClose: 5000,
      theme: "light",
      transition: Bounce,
    });
    throw new Error(`${response.status}`);
  }
  toast.success("Попытка теста удалена", {
    position: "top-right",
    autoClose: 5000,
    theme: "light",
    transition: Bounce,
  });
}

export async function updateExam(
  id: number,
  updatedData: UpdateTestResultInput,
) {
  const response = await fetch(`${baseApi}/test-results/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedData),
  });
  if (!response.ok) {
    throw new Error(`${response.status}`);
  }
  toast.success("Данные экзамена обновлены обновлены", {
    position: "top-right",
    autoClose: 5000,
    theme: "light",
    transition: Bounce,
  });
}
