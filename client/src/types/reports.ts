type ReportTypes = "table" | "text";

export interface ReportPreview {
  id: number;
  type: ReportTypes;
  name: string;
  slug: ReportKind;
}

export type ReportKind = "analytical" | "statistics" | "summary";
export interface ReportDate { date: string; records: number; completed: number }
export interface ReportOptions {
  startDate: string;
  endDate: string;
  dates: string[];
  recalculate: boolean;
}
