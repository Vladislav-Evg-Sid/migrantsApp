import { Box, Button } from "@mui/material";
import { NavLink } from "react-router";

interface ActiveElement {
  isActive: boolean;
}

interface NavButtonProp {
  to: string;
  text: string;
}

function styleedActiveLink({ isActive }: ActiveElement) {
  return { fontWeight: isActive ? "bold" : "normal" };
}

function NavButton({ to, text }: NavButtonProp) {
  return (
    <NavLink to={to} style={styleedActiveLink}>
      {text}
    </NavLink>
  );
}

export default function Navbar() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "start",
        background: "#0047AB",
      }}
    >
      <NavButton to="/" text="Отчёты" />
      <NavButton to="/tables/exams" text="Экзамены" />
      <NavButton to="/tables/participants" text="Люди" />
      <NavButton to="/references/areas" text="Округа" />
      <NavButton to="/references/schools" text="Школы" />
      <NavButton to="/references/nations" text="Национальности" />
      <NavButton to="/references/attempts" text="Кратность сдачи" />
      <NavButton to="/references/statuses" text="Статусы" />
    </Box>
  );
}
