import { Box } from "@mui/material";
import FilterRow from "../components/FilterRow";
import { getParticipantsFilters } from "../services/filters";
import { useEffect, useState } from "react";
import { type CellFilter } from "../types/filters";

export default function ParticipantsPage() {
  const [filterValues, setFilterValues] = useState<CellFilter[]>([]);

  useEffect(() => {
    const fetchfilters = async () =>
      setFilterValues(await getParticipantsFilters());
    fetchfilters();
  }, []);

  return (
    <Box
      sx={{
        m: "2%",
      }}
    >
      <FilterRow filters={filterValues} />
    </Box>
  );
}
