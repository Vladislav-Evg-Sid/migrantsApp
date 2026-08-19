import { Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import "./App.css";

import Reports from "./pages/reports";
import Schools from "./pages/schools";
import SideBar from "./components/sideBar";

function App() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Box
        sx={{
          maxWidth: "300px",
          width: "15vw",
        }}
      >
        <SideBar />
      </Box>
      <Box>
        <Routes>
          <Route path="/" element={<Reports />} />
          <Route path="/references/schools" element={<Schools />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
