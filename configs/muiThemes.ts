import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import { robotoFont } from "./constants";

export const darkTheme = createTheme({
  palette: {
    mode: "dark", // ,"light"
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: robotoFont.style.fontFamily,
  },
});