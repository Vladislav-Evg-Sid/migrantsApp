import { Route, Routes } from "react-router";
import { Box, Grid } from "@mui/material";
import "./App.css";

import Reports from "./pages/reports";
import Schools from "./pages/schools";
import Navbar from "./components/navbar";

function App() {
  return (
    <Grid container>
      <Grid size={3}>
        <Navbar />
      </Grid>
      <Grid size={9}>
        <Routes>
          <Route path="/" element={<Reports />} />
          <Route path="/references/schools" element={<Schools />} />
        </Routes>
      </Grid>
    </Grid>
  );
}

export default App;
