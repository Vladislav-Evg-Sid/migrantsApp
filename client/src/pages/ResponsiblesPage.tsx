import { Box, Grid } from "@mui/material";
import { useEffect, useState } from "react";
import { Bounce, ToastContainer } from "react-toastify";
import { type TableData } from "../types/tables";
import DataTable from "../components/DataTable";
import ReferencesTable from "../components/ReferenceTable";

export default function ResponsiblesPage() {
  return (
    <Box
      sx={{
        width: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        margin: "0.5%",
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
        <Grid size={6}>
          <ReferencesTable height="95vh" tableName="area-responsibles" />
        </Grid>
        <Grid size={6}>
          <ReferencesTable height="95vh" tableName="ppts" />
        </Grid>
      </Grid>
    </Box>
  );
}
