import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert, Box, Button, Checkbox, Chip, CircularProgress, FormControlLabel,
  Paper, Stack, Switch, TextField, Typography,
} from "@mui/material";
import { ArrowBack, Download } from "@mui/icons-material";
import { downloadReport, getReportDates } from "../api/reports";
import type { ReportDate, ReportKind } from "../types/reports";

const titles: Record<ReportKind, string> = {
  analytical: "Статистико-аналитическая справка", statistics: "Статистика ИГ", summary: "Сводная",
};
const formatDate = (value: string) => value.split("-").reverse().join(".");

export default function ReportParametersPage() {
  const { kind } = useParams();
  const navigate = useNavigate();
  const reportKind = kind as ReportKind;
  const validKind = Object.hasOwn(titles, reportKind);
  const [dates, setDates] = useState<ReportDate[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[] | null>(null);
  const [recalculate, setRecalculate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getReportDates(controller.signal).then(values => {
      setDates(values);
      setStartDate(values[0]?.date ?? "");
      setEndDate(values.at(-1)?.date ?? "");
      setLoading(false);
    }).catch(error => {
      if (controller.signal.aborted) return;
      setError(error instanceof Error ? error.message : "Не удалось загрузить даты");
      setLoading(false);
    });
    return () => controller.abort();
  }, [reload]);

  const periodValid = Boolean(startDate && endDate && startDate <= endDate);
  const available = dates.filter(item => item.date >= startDate && item.date <= endDate
    && (!recalculate || reportKind === "summary" || item.completed > 0));
  const chosen = available.filter(item => selectedDates === null || selectedDates.includes(item.date)).map(item => item.date);
  const total = available.reduce((sum, item) => sum + (recalculate && reportKind !== "summary" ? item.completed : item.records), 0);

  async function build() {
    setBuilding(true);
    setError("");
    setSuccess(false);
    try {
      await downloadReport(reportKind, { startDate, endDate, dates: reportKind === "statistics" ? chosen : [], recalculate });
      setSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Не удалось построить отчёт");
    } finally {
      setBuilding(false);
    }
  }

  if (!validKind) return <Alert severity="error" sx={{ m: 3 }}>Отчёт не найден</Alert>;
  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto", textAlign: "left", color: "black" }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate("/")} sx={{ mb: 2, textTransform: "none" }}>К отчётам</Button>
      <Typography variant="h5" sx={{ mb: 3 }}>{titles[reportKind]}</Typography>
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, backgroundColor: "#F3F3F3" }}>
        {loading ? <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}><CircularProgress size={24} /><Typography>Загрузка дат тестирования…</Typography></Stack> : (
          <Stack spacing={3}>
            {!dates.length && !error && <Alert severity="info">Пока нет данных о тестированиях.</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="Начало периода" type="date" value={startDate} onChange={event => { setStartDate(event.target.value); setSuccess(false); }} slotProps={{ inputLabel: { shrink: true } }} disabled={building || !dates.length} fullWidth />
              <TextField label="Конец периода" type="date" value={endDate} onChange={event => { setEndDate(event.target.value); setSuccess(false); }} slotProps={{ inputLabel: { shrink: true } }} disabled={building || !dates.length} fullWidth />
            </Stack>
            {startDate && endDate && !periodValid && <Alert severity="warning">Начало периода должно быть не позже конца.</Alert>}
            <FormControlLabel control={<Switch checked={recalculate} disabled={building} onChange={event => { setRecalculate(event.target.checked); setSuccess(false); }} />} label="Пересчитать кратность тестирования" />
            {reportKind === "statistics" && periodValid && <Box>
              <Typography variant="subtitle1">Даты построения таблиц</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <Button size="small" disabled={building} onClick={() => setSelectedDates(null)}>Выбрать все</Button>
                <Button size="small" disabled={building} onClick={() => setSelectedDates([])}>Снять выбор</Button>
              </Stack>
              <Box sx={{ display: "flex", flexWrap: "wrap", maxHeight: 280, overflow: "auto", p: 1, backgroundColor: "white", borderRadius: 2 }}>
                {available.map(item => <FormControlLabel key={item.date} sx={{ minWidth: 170 }} label={formatDate(item.date)} control={<Checkbox disabled={building} checked={chosen.includes(item.date)} onChange={event => setSelectedDates(event.target.checked ? [...chosen, item.date] : chosen.filter(date => date !== item.date))} />} />)}
                {!available.length && <Typography variant="body2">Нет доступных дат в выбранном периоде.</Typography>}
              </Box>
            </Box>}
            {reportKind === "statistics" && periodValid && <Chip label={`Выбрано дат: ${chosen.length}`} sx={{ alignSelf: "flex-start" }} />}
            {error && <Alert severity="error" action={!dates.length ? <Button onClick={() => { setError(""); setLoading(true); setReload(value => value + 1); }}>Повторить</Button> : undefined}>{error}</Alert>}
            {success && <Alert severity="success">Отчёт готов. Скачивание началось.</Alert>}
            <Button variant="contained" color="success" startIcon={building ? <CircularProgress size={18} color="inherit" /> : <Download />} disabled={loading || building || !periodValid || !total || (reportKind === "statistics" && !chosen.length)} onClick={() => void build()} sx={{ textTransform: "none", alignSelf: "flex-start" }}>
              {building ? "Формирование отчёта…" : reportKind === "summary" && recalculate ? "Скачать две таблицы" : reportKind === "analytical" ? "Скачать Word" : "Скачать Excel"}
            </Button>
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
