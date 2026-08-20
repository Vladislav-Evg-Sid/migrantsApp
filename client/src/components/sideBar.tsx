import { Box, Typography } from "@mui/material";
import { useNavigate, NavLink } from "react-router-dom";

import logoCompany from "../assets/logo.png";

interface NavButtonProps {
  to: string;
  text: string;
}

export default function SideBar() {
  const navigate = useNavigate();

  const NavButton = ({ to, text }: NavButtonProps) => {
    return (
      <Box
        component={NavLink}
        to={to}
        sx={{
          width: "100%",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          minHeight: 48,
          my: 0.2,
          px: 2,
          color: "rgba(255, 255, 255, 0.82)",
          fontSize: "0.95rem",
          fontWeight: 500,
          textAlign: "left",
          textDecoration: "none",
          borderRadius: 2,
          borderLeft: "4px solid transparent",
          transition:
            "background-color 160ms ease, color 160ms ease, transform 160ms ease",
          "&:hover": {
            color: "#fff",
            backgroundColor: "rgba(255, 255, 255, 0.12)",
            transform: "translateX(2px)",
          },
          "&:focus-visible": {
            outline: "2px solid #fff",
            outlineOffset: 2,
          },
          "&.active": {
            color: "#0047AB",
            backgroundColor: "#fff",
            borderLeftColor: "#7CB9E8",
            fontWeight: 700,
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.16)",
          },
        }}
      >
        {text}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#0047AB",
        height: "100vh",
      }}
    >
      <Box>
        <img
          src={logoCompany}
          alt="Company Logo"
          style={{ width: "100%", maxWidth: 300, cursor: "pointer" }}
          onClick={() => navigate("/")}
        />
        <Typography variant="h4" sx={{ color: "#FFFFFF" }}>
          Мигранты
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          width: "90%",
        }}
      >
        <NavButton to="/" text="Отчёты" />
        <NavButton to="/exams" text="Экзамены" />
        <NavButton to="/participants" text="Люди" />
        <NavButton to="/references" text="Справочники" />
        <NavButton to="/contacts" text="Контактные данные" />
      </Box>
    </Box>
  );
}
