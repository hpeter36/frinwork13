import React, {
  useState,
  useCallback,
  useEffect,
  createContext,
  useContext,
  ReactNode,
  FC,
  Dispatch,
  SetStateAction,
} from "react";

export type Mode = "light" | "dark";

export interface TwCssThemeContextProps {
  mode?: Mode;
  toggleMode?: () => void | null;
}

export const TwCssThemeContext = createContext<TwCssThemeContextProps>({});

interface TwCssThemeProviderProps {
  children: ReactNode;
  value: TwCssThemeContextProps;
}

export const TwCssThemeProvider: FC<TwCssThemeProviderProps> = ({
  children,
  value,
}) => {
  return (
    <TwCssThemeContext.Provider value={value}>
      {children}
    </TwCssThemeContext.Provider>
  );
};

export const useTwCssTheme: () => TwCssThemeContextProps = () => {
  return useContext(TwCssThemeContext);
};

const isClient: () => boolean = () => {
  return typeof window !== "undefined";
};

const prefersColorScheme: () => Mode = () => {
  if (!isClient()) {
    return "light";
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useTwCssThemeMode: () => [
  Mode,
  Dispatch<SetStateAction<Mode>>,
  () => void
] = () => {
  // toggle theme
  const onToggleMode = () => {
    const newMode = mode === "dark" ? "light" : "dark";

    setModeOnBody(newMode);
    setMode(newMode);
  };

  // set class on body
  const setModeOnBody = useCallback((mode: Mode) => {
    if (!isClient()) {
      return;
    }

    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const { mode: initialMode, toggleMode = onToggleMode } =
    useContext(TwCssThemeContext);
  const [mode, setMode] = useState<Mode>("light");

  useEffect(() => {
    if (initialMode) {
      setModeOnBody(initialMode);
      setMode(initialMode);
    } else {
      setMode(prefersColorScheme());
    }
  }, [initialMode, setModeOnBody, setMode]);

  return [mode, setMode, toggleMode];
};
