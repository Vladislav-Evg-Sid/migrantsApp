import { Box, Grid } from "@mui/material";
import { ToastContainer, Bounce } from "react-toastify";

import ReferencesTable from "../components/ReferenceTable";
import { useState } from "react";

export default function ReferencesPage() {
  const [rerenderSchoolSignal, setRerenderSchoolSignal] =
    useState<boolean>(false);

  const handleRerenderSchoolSignal = () => {
    setRerenderSchoolSignal((prev) => !prev);
  };

  return (
    <Box
      sx={{
        width: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "2%",
      }}
    >
      <ToastContainer
        position="top-right"
        autoClose={5000}
        newestOnTop={false}
        closeOnClick
        theme="light"
        transition={Bounce}
      />
      <Grid container spacing={2}>
        <Grid size={5}>
          <ReferencesTable
            tableName="areas"
            rerenderDependencies={handleRerenderSchoolSignal}
          />
        </Grid>
        <Grid size={7}>
          <ReferencesTable
            tableName="schools"
            rerenderSignal={rerenderSchoolSignal}
          />
        </Grid>
        <Grid size={4}>
          <ReferencesTable tableName="test-attempts" />
        </Grid>
        <Grid size={4}>
          <ReferencesTable tableName="participant-statuses" />
        </Grid>
        <Grid size={4}>
          <ReferencesTable tableName="nations" />
        </Grid>
      </Grid>
    </Box>
  );
}
