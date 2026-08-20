import { Box, Grid } from "@mui/material";
import { ToastContainer, Bounce } from "react-toastify";

import ReferencesTable from "../components/ReferenceTable";

export default function ReferencesPage() {
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
          <ReferencesTable tableName="areas" />
        </Grid>
        <Grid size={7}>
          <ReferencesTable tableName="schools" />
        </Grid>
        <Grid size={4}>
          <ReferencesTable tableName="attempts" />
        </Grid>
        <Grid size={4}>
          <ReferencesTable tableName="statuses" />
        </Grid>
        <Grid size={4}>
          <ReferencesTable tableName="nations" />
        </Grid>
      </Grid>
    </Box>
  );
}
