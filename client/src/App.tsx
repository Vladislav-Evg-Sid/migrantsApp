import { Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import "./App.css";

import SideBar from "./components/sideBar";
import ReferencesPage from "./pages/ReferencesPage";
import ReportsPage from "./pages/ReportsPage";
import ExamDatePage from "./pages/ExamDatesPage";
import ParticipantsPage from "./pages/ParticipantsPage";
import ResponsiblesPage from "./pages/ResponsiblesPage";
import ParticipantDetailsPage from "./pages/ParticipantDetailsPage";
import ExamPptsPage from "./pages/ExamPptsPage";
import ExamParticipantsPage from "./pages/ExamParticipants";

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
          width: "clamp(220px, 20vw, 300px)",
          flexShrink: 0,
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
          <Route path="/exams/:dateId" element={<ExamPptsPage />} />
          <Route
            path="/exams/:dateId/ppt/:pptId"
            element={<ExamParticipantsPage />}
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
