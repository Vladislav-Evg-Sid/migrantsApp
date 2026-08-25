import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return dateFormatter.format(new Date(year ?? 0, (month ?? 1) - 1, day ?? 1));
}

export default function AddExamDatesDialog() {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [dateAlreadySelected, setDateAlreadySelected] = useState(false);

  const closeDialog = () => {
    setDialogIsOpen(false);
    setCurrentDate("");
    setSelectedDates([]);
    setDateAlreadySelected(false);
  };

  const addCurrentDate = () => {
    if (!currentDate) return;

    if (selectedDates.includes(currentDate)) {
      setDateAlreadySelected(true);
      return;
    }

    setSelectedDates((dates) => [...dates, currentDate].sort());
    setCurrentDate("");
    setDateAlreadySelected(false);
  };

  const confirmDates = () => {
    alert(
      `Будут добавлены даты:\n${selectedDates
        .map((date) => `• ${formatDate(date)}`)
        .join("\n")}`,
    );
    closeDialog();
  };

  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setDialogIsOpen(true)}
        sx={{ borderRadius: 2, px: 2.5, py: 1, textTransform: "none" }}
      >
        Добавить даты
      </Button>

      <Dialog open={dialogIsOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          Добавление дат экзаменов
        </DialogTitle>
        <DialogContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              type="date"
              value={currentDate}
              onChange={(event) => {
                setCurrentDate(event.target.value);
                setDateAlreadySelected(false);
              }}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <Button
              variant="outlined"
              onClick={addCurrentDate}
              disabled={!currentDate}
              sx={{ flexShrink: 0, textTransform: "none" }}
            >
              Добавить
            </Button>
          </Stack>

          {dateAlreadySelected && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Эта дата уже выбрана.
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography sx={{ mb: 1, fontWeight: 600 }}>
              Выбранные даты ({selectedDates.length})
            </Typography>
            {selectedDates.length === 0 ? (
              <Typography color="text.secondary">
                Пока не выбрано ни одной даты
              </Typography>
            ) : (
              <Stack
                direction="row"
                useFlexGap
                spacing={1}
                sx={{ flexWrap: "wrap" }}
              >
                {selectedDates.map((date) => (
                  <Chip
                    key={date}
                    label={formatDate(date)}
                    onDelete={() =>
                      setSelectedDates((dates) =>
                        dates.filter((selectedDate) => selectedDate !== date),
                      )
                    }
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDialog}>Отмена</Button>
          <Button
            variant="contained"
            disabled={selectedDates.length === 0}
            onClick={confirmDates}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
