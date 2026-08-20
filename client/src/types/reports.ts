type ReportTypes = "table" | "text";

export interface ReportPreview {
  id: number;
  type: ReportTypes;
  name: string;
}
