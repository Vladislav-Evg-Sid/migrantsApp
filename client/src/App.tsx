import { Route, Routes, useLocation } from "react-router-dom";
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
import ReportParametersPage from "./pages/ReportParametersPage";
import DataImportPage from "./pages/DataImportPage";

function App() {
  const location = useLocation();
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
          <Route path="/reports/:kind" element={<ReportParametersPage key={location.pathname} />} />
          <Route path="/references" element={<ReferencesPage />} />
          <Route path="/exams" element={<ExamDatePage />} />
          <Route path="/participants" element={<ParticipantsPage />} />
          <Route path="/contacts" element={<ResponsiblesPage />} />
          <Route path="/imports" element={<DataImportPage />} />
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
