import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

import { type CellFilter } from "../types/filters";

interface FilterPanelProps {
  filters: CellFilter[];
}

export default function FilterPanel({ filters }: FilterPanelProps) {
  return (
    <Box
      sx={{
        backgroundColor: "#D9D9D9",
        borderRadius: 10,
        p: 2,
      }}
    >
      <TableContainer
        component={Paper}
        sx={{
          maxWidth: "100%",
          maxHeight: "90%",
          mb: 4,
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <Table size="small" sx={{ width: "100%", tableLayout: "fixed" }}>
          <TableHead>
            <TableRow>
              {filters.map(({ name }, index) => (
                <TableCell
                  key={index}
                  align="center"
                  sx={{
                    border: `1px solid #000000`,
                    fontWeight: 600,
                    lineHeight: 1.35,
                    textAlign: "center",
                    verticalAlign: "middle",
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                  }}
                >
                  {name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow
              sx={{
                "&:nth-of-type(even)": {
                  backgroundColor: "#FAFBFC",
                },
              }}
            >
              {filters.map(({ type, variants }, index) => (
                <TableCell
                  key={index}
                  align="center"
                  sx={{
                    border: `1px solid #000000`,
                    lineHeight: 1.4,
                    verticalAlign: "top",
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                  }}
                >
                  {type === "select" ? (
                    <FormControl fullWidth>
                      <InputLabel id="demo-simple-select-label"></InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        // value={variants}
                        // label="Age"
                        // onChange={handleChange}
                      >
                        {(variants ?? [[-1, "Ошибка"]]).map((variant) => (
                          <MenuItem value={variant[0]}>{variant[1]}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      // value={values[index] ?? ""}
                      // onChange={(event) => setValue(index, event.target.value)}
                      inputMode={type === "number" ? "numeric" : "text"}
                      fullWidth
                      // disabled={index === 0 && editMode}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
