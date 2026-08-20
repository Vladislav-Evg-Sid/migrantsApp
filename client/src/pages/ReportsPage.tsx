import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import iconText from "../assets/icon_text.png";
import iconTable from "../assets/icon_table.png";
import { type ReportPreview } from "../types/reports";
import { getReports } from "../api/reports";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportPreview[]>([]);

  useEffect(() => {
    const fetchReports = async () => setReports(await getReports());
    fetchReports();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        m: 2,
      }}
    >
      {reports.map((report) => (
        <Card
          key={report.id}
          onClick={() => alert("Переход к отчёту пока не осуществлён")}
          sx={{ maxWidth: 300, m: "0.5%" }}
        >
          <CardActionArea>
            <CardMedia
              component="img"
              image={report.type === "text" ? iconText : iconTable}
              alt={
                report.type === "text" ? "Текстовый отчёт" : "Табличный отчёт"
              }
            />
            <CardContent>
              <Typography>{report.name}</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  );
}
