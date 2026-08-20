import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Month, type ExamDate } from "../types/exams";
import { getExamDates } from "../api/exams";

export default function ExamDatePage() {
  const [examDates, setExamDates] = useState<ExamDate>(new Map());

  useEffect(() => {
    const fetchExamDates = async () => {
      setExamDates(await getExamDates());
    };

    fetchExamDates();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 3,
        }}
      >
        Даты экзаменов
      </Typography>

      <Stack spacing={2}>
        {[...examDates.entries()]
          .sort(([yearA], [yearB]) => yearA - yearB)
          .map(([year, months]) => (
            <Accordion
              key={year}
              disableGutters
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                "&:before": {
                  display: "none",
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  px: 3,
                  minHeight: 64,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {year}
                </Typography>
              </AccordionSummary>

              <AccordionDetails sx={{ px: 2, pb: 2 }}>
                <Stack spacing={1.5}>
                  {[...months.entries()]
                    .sort(([monthA], [monthB]) => monthA - monthB)
                    .map(([month, days]) => (
                      <Accordion
                        key={month}
                        disableGutters
                        elevation={0}
                        sx={{
                          border: 1,
                          borderColor: "divider",
                          borderRadius: 2,
                          "&:before": {
                            display: "none",
                          },
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{
                            px: 2,
                          }}
                        >
                          <Typography sx={{ fontWeight: 600 }}>
                            {Month[month]}
                          </Typography>
                        </AccordionSummary>

                        <AccordionDetails>
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: {
                                xs: "repeat(3, 1fr)",
                                sm: "repeat(5, 1fr)",
                                md: "repeat(7, 1fr)",
                              },
                              gap: 1,
                            }}
                          >
                            {[...days]
                              .sort((a, b) => a - b)
                              .map((day) => (
                                <Button
                                  key={day}
                                  variant="outlined"
                                  onClick={() => {
                                    alert(
                                      `Переход на страницу с экзамена с датой ${day}.${month}.${year}`,
                                    );
                                  }}
                                  sx={{
                                    minWidth: 0,
                                    py: 1.25,
                                    fontWeight: 600,
                                    borderRadius: 2,
                                  }}
                                >
                                  {day}
                                </Button>
                              ))}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
      </Stack>
    </Container>
  );
}
