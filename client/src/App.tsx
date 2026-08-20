import { Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import "./App.css";

import Reports from "./pages/ReportsPage";
import SideBar from "./components/SideBar";
import References from "./pages/ReferencesPage";

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
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Routes>
          <Route path="/" element={<Reports />} />
          <Route path="/references" element={<References />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
