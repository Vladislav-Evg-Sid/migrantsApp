import { Box } from "@mui/material";
import { useNavigate, NavLink } from "react-router-dom";

import logoCompany from "../assets/logo.png";

interface ActiveElement {
  isActive: boolean;
}

interface NavButtonProps {
  to: string;
  text: string;
}

export default function Navbar() {
  const navigate = useNavigate();

  const styleedActiveLink = ({ isActive }: ActiveElement) => {
    return { fontWeight: isActive ? "bold" : "normal" };
  };

  const NavButton = ({ to, text }: NavButtonProps) => {
    return (
      <NavLink to={to} style={styleedActiveLink}>
        {text}
      </NavLink>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        background: "#0047AB",
        height: "100vh",
      }}
    >
      <img
        src={logoCompany}
        alt="Company Logo"
        style={{ width: "100%", maxWidth: 300, cursor: "pointer" }}
        onClick={() => navigate("/")}
      />
      <NavButton to="/" text="Отчёты" />
      <NavButton to="/exams" text="Экзамены" />
      <NavButton to="/participants" text="Люди" />
      <NavButton to="/references/areas" text="Округа" />
      <NavButton to="/references/schools" text="Школы" />
      <NavButton to="/references/nations" text="Национальности" />
      <NavButton to="/references/attempts" text="Кратность сдачи" />
      <NavButton to="/references/statuses" text="Статусы" />
    </Box>
  );
}
