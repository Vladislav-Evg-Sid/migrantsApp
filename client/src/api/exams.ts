import { Bounce, toast } from "react-toastify";
import { baseApi } from "../env";
import { type ExamDate, type Month } from "../types/exams";
import type { TableCellData } from "../types/tables";
import type { UpdateTestResultInput } from "../types/dto";

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
  const data = await response.json();
  console.log(data);

  return new Map([
    [
      2025,
      new Map([
        [
          1,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          2,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          3,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          4,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          5,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          6,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          7,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          8,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          9,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          10,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          11,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          12,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
      ]),
    ],
    [
      2026,
      new Map([
        [
          1,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          2,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          3,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          4,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          5,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          6,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          7,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          8,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          9,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          10,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          11,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
        [
          12,
          [
            { id: 1, day: 14 },
            { id: 2, day: 16 },
          ],
        ],
      ]),
    ],
  ]);
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
