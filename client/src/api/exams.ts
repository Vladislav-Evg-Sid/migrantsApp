import { Bounce, toast } from "react-toastify";
import { baseApi } from "../env";
import { type ExamDate, type Month } from "../types/exams";

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

  // return new Map([
  //   [
  //     2025,
  //     new Map([
  //       [1, [14, 16]],
  //       [2, [14, 16]],
  //       [3, [14, 16]],
  //       [4, [14, 16]],
  //       [5, [14, 16]],
  //       [6, [14, 16]],
  //       [7, [14, 16]],
  //       [8, [14, 16]],
  //       [9, [14, 16]],
  //       [10, [14, 16]],
  //       [11, [14, 16]],
  //       [12, [14, 16]],
  //     ]),
  //   ],
  //   [
  //     2026,
  //     new Map([
  //       [1, [14, 16]],
  //       [2, [14, 16]],
  //       [3, [14, 16]],
  //       [4, [14, 16]],
  //       [5, [14, 16]],
  //       [6, [14, 16]],
  //       [7, [14, 16]],
  //       [8, [14, 16]],
  //       [9, [14, 16]],
  //       [10, [14, 16]],
  //       [11, [14, 16]],
  //       [12, [14, 16]],
  //     ]),
  //   ],
  // ]);
}
