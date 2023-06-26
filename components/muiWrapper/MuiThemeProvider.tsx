"use client";

import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { darkTheme } from "@/configs/muiThemes";

export default function MuiThemeProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  //let [useDarkTheme, setUseDarkTheme] = useState(false);
  //let [theme, setTheme] = useState(useDarkTheme ? darkTheme : lightTheme);

  // const changeThemeHandler = (target: ChangeEvent, currentValue: boolean) => {
  //   setUseDarkTheme(currentValue);
  //   setTheme(currentValue ? darkTheme : lightTheme);
  // };

  return (
    <ThemeProvider theme={darkTheme}>
      {/* <CssBaseline /> */}
      {children}
    </ThemeProvider>
  );
}
