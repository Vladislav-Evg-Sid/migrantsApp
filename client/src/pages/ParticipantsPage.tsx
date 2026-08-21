import { Box } from "@mui/material";
import FilterPanel from "../components/FilterPanel";

export default function ParticipantsPage() {
  return (
    <Box
      sx={{
        m: "2%",
      }}
    >
      <FilterPanel
        filters={[
          {
            name: "Национальность",
            type: "select",
            variants: [
              [1, "Китай"],
              [2, "Армения"],
              [3, "США"],
            ],
          },
          {
            name: "ФИО",
            type: "string",
          },
        ]}
      />
    </Box>
  );
}
