import { useState } from "react";
import {
  Alert, Box, Button, Card, CardActionArea, CardContent, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Snackbar, Stack, Typography,
} from "@mui/material";
import { FileUpload, GroupAdd, EventNote } from "@mui/icons-material";
import { baseApi } from "../env";

export default function DataImportPage() {
  const [dialog, setDialog] = useState<"warning" | "upload" | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<string[]>([]);
  const [notification, setNotification] = useState("");

  function close() {
    if (uploading) return;
    setDialog(null);
    setFile(null);
    setError("");
    setIssues([]);
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    setError("");
    setIssues([]);
    try {
      const response = await fetch(`${baseApi}/imports/summary`, {
        method: "POST", headers: { "Content-Type": "application/octet-stream", "X-Confirm-Replacement": "true" }, body: file,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setError(result?.message || "Не удалось загрузить сводную. Попробуйте ещё раз.");
        setIssues(result?.issues || []);
        return;
      }
      setDialog(null);
      setFile(null);
      setNotification(`Загружено участников: ${result.participants}, экзаменов: ${result.exams}.`);
    } catch {
      setError("Не удалось получить ответ. Проверьте подключение и список участников перед повторной загрузкой.");
    } finally { setUploading(false); }
  }

  const later = () => setNotification("Этот функционал будет доработан позже.");
  const modes = [
    { title: "Импорт сводной", icon: <FileUpload fontSize="large" />, action: () => setDialog("warning") },
    { title: "Загрузка новых участников", icon: <GroupAdd fontSize="large" />, action: later },
    { title: "Загрузка новых экзаменов", icon: <EventNote fontSize="large" />, action: later },
  ];

  return (
    <Box sx={{ p: 3, color: "black", textAlign: "left" }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Загрузка данных</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {modes.map(mode => <Card key={mode.title} sx={{ width: 280, borderRadius: 3 }}>
          <CardActionArea onClick={mode.action}>
            <CardContent sx={{ p: 3, minHeight: 130 }}>
              <Box sx={{ color: "#0047AB", mb: 2 }}>{mode.icon}</Box>
              <Typography variant="h6">{mode.title}</Typography>
            </CardContent>
          </CardActionArea>
        </Card>)}
      </Box>
      <Dialog open={dialog === "warning"} onClose={close} maxWidth="sm" fullWidth>
        <DialogTitle>Заменить данные сводной?</DialogTitle>
        <DialogContent><DialogContentText>Импорт сводной удалит текущие данные об участниках и экзаменах и заменит их данными из файла. Продолжить?</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={close} sx={{ textTransform: "none" }}>Отмена</Button>
          <Button onClick={() => setDialog("upload")} color="warning" variant="contained" sx={{ textTransform: "none" }}>Продолжить</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={dialog === "upload"} onClose={close} maxWidth="sm" fullWidth>
        <DialogTitle>Импорт сводной</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
          <Typography>Выберите файл сводной в формате Excel (.xlsx).</Typography>
          <Button component="label" variant="outlined" disabled={uploading} startIcon={<FileUpload />} sx={{ textTransform: "none", alignSelf: "flex-start" }}>
            Выбрать файл
            <input type="file" accept=".xlsx" hidden onChange={event => {
              const selected = event.target.files?.[0];
              event.target.value = "";
              setFile(null); setError(""); setIssues([]);
              if (!selected) return;
              if (!selected.name.toLowerCase().endsWith(".xlsx")) { setError("Выберите файл в формате .xlsx"); return; }
              if (selected.size > 20 * 1024 * 1024) { setError("Размер файла не должен превышать 20 МБ"); return; }
              setFile(selected);
            }} />
          </Button>
          {file && <Typography sx={{ overflowWrap: "anywhere" }}>{file.name}</Typography>}
          {error && <Alert severity="error"><Typography variant="body2">{error}</Typography>{issues.length > 0 && <Box component="ul" sx={{ pl: 2, mb: 0, maxHeight: 250, overflow: "auto" }}>{issues.map((issue,index) => <li key={index}>{issue}</li>)}</Box>}</Alert>}
          {uploading && <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}><CircularProgress size={22} /><Typography>Загрузка данных…</Typography></Stack>}
        </Stack></DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={uploading} sx={{ textTransform: "none" }}>Отмена</Button>
          <Button onClick={() => void upload()} disabled={!file || uploading} color="warning" variant="contained" sx={{ textTransform: "none" }}>Заменить данные</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={Boolean(notification)} autoHideDuration={8000} onClose={() => setNotification("")} message={notification} />
    </Box>
  );
}
