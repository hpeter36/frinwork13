"use client";

import * as React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CssBaseline from "@mui/material/CssBaseline";
import NextAppDirEmotionCacheProvider from "./EmotionCache";
import { muiLightTheme, muiDarkTheme } from "./theme";

import {
  TwCssThemeContext,
  useTwCssTheme,
  useTwCssThemeMode,
} from "../TwCssThemeContext";

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

export default function MuiThemeRegistry({
  children,
}: {
  children: React.ReactNode;
}) {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = React.useState<"light" | "dark">(() =>
    prefersDarkMode ? "dark" : "light"
  );
  const [twCssmode, setTwCssMode, twCssToggleMode] = useTwCssThemeMode(); // MUI twcss téma szétszedhető, szerintem még akár ettől a MuiThemeRegistry-től is !!!

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  // Mui set theme
  const theme = React.useMemo(
    () =>
      mode === "light" ? createTheme(muiLightTheme) : createTheme(muiDarkTheme),
    [mode]
  );

  // twcss initial settings
  React.useEffect(() => {
    if (mode === "dark") {
      setMode("dark");
      document.documentElement.classList.add("dark");
    } else {
      setMode("light");
      document.documentElement.classList.remove("dark");
    }
  }, [mode, setMode]);

  // twcss context value
  const twCssThemeContextValue = React.useMemo(
    () => ({
      mode,
      twCssToggleMode,
    }),
    [mode, twCssToggleMode]
  );

  return (
    <NextAppDirEmotionCacheProvider options={{ key: "mui" }}>
      <TwCssThemeContext.Provider value={twCssThemeContextValue}>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            {children}
          </ThemeProvider>
        </ColorModeContext.Provider>
      </TwCssThemeContext.Provider>
    </NextAppDirEmotionCacheProvider>
  );
}
