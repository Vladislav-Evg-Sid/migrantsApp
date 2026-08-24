import { Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import "./App.css";

import SideBar from "./components/SideBar";
import ReferencesPage from "./pages/ReferencesPage";
import ReportsPage from "./pages/ReportsPage";
import ExamDatePage from "./pages/ExamDatesPage";
import ParticipantsPage from "./pages/ParticipantsPage";
import ResponsiblesPage from "./pages/ResponsiblesPage";
import ParticipantDetailsPage from "./pages/ParticipantDetailsPage";

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
          <Route path="/" element={<ReportsPage />} />
          <Route path="/references" element={<ReferencesPage />} />
          <Route path="/exams" element={<ExamDatePage />} />
          <Route path="/participants" element={<ParticipantsPage />} />
          <Route path="/contacts" element={<ResponsiblesPage />} />
          <Route
            path="/participants/details/:id"
            element={<ParticipantDetailsPage />}
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
