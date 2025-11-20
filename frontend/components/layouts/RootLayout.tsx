import { useState, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { frFR } from "@mui/material/locale";
import { SnackbarProvider } from "notistack";
import { Header } from "../Header";
import { FloatingButton } from "../FloatingButton";
import { SimulationProvider } from "../../contexts/SimulationContext";

export default function RootLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  const theme = useMemo(
    () =>
      createTheme(
        {
          palette: {
            mode: darkMode ? "dark" : "light",
            primary: {
              main: darkMode ? "#f1f5f9" : "#1e293b",
              light: darkMode ? "#ffffff" : "#334155",
              dark: darkMode ? "#cbd5e1" : "#0f172a",
            },
            secondary: {
              main: "#d4af37",
              light: "#f0d98d",
              dark: "#a68929",
            },
            background: {
              default: darkMode ? "#0f172a" : "#ffffff",
              paper: darkMode ? "#1e293b" : "#ffffff",
            },
            text: {
              primary: darkMode ? "#f1f5f9" : "#0f172a",
              secondary: darkMode ? "#94a3b8" : "#64748b",
            },
            success: {
              main: darkMode ? "#34d399" : "#10b981",
            },
            warning: {
              main: darkMode ? "#fbbf24" : "#f59e0b",
            },
            error: {
              main: darkMode ? "#dc2626" : "#ef4444",
            },
            divider: darkMode ? "#334155" : "#e2e8f0",
          },
          typography: {
            fontFamily: "'Inter', 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            h1: {
              fontWeight: 600,
              fontSize: "2.5rem",
            },
            h2: {
              fontWeight: 600,
              fontSize: "2rem",
            },
            h3: {
              fontWeight: 600,
              fontSize: "1.5rem",
            },
            h4: {
              fontWeight: 600,
              fontSize: "1.25rem",
            },
            h5: {
              fontWeight: 600,
              fontSize: "1.1rem",
            },
            h6: {
              fontWeight: 600,
              fontSize: "1rem",
            },
            button: {
              textTransform: "none",
              fontWeight: 500,
            },
          },
          shape: {
            borderRadius: 12,
          },
          components: {
            MuiButton: {
              styleOverrides: {
                root: {
                  borderRadius: 12,
                  padding: "10px 24px",
                },
                contained: {
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(212, 175, 55, 0.2)",
                  },
                },
              },
            },
            MuiCard: {
              styleOverrides: {
                root: {
                  borderRadius: 16,
                  boxShadow: darkMode
                    ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                    : "0 4px 20px rgba(0, 0, 0, 0.08)",
                },
              },
            },
            MuiChip: {
              styleOverrides: {
                root: {
                  borderRadius: 8,
                },
              },
            },
            MuiTextField: {
              styleOverrides: {
                root: {
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 12,
                  },
                },
              },
            },
          },
        },
        frFR
      ),
    [darkMode]
  );

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Déterminer la vue actuelle basée sur le pathname
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === "/") return "home";
    if (path === "/dashboard") return "dashboard";
    if (path === "/simulation") return "details";
    if (path === "/report") return "report";
    return "home";
  };

  const currentView = getCurrentView();
  const showFloatingButton = currentView !== "home";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <SimulationProvider>
          <div style={{ minHeight: "100vh", backgroundColor: theme.palette.background.default }}>
            <Header
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              currentView={currentView}
            />

            <main>
              <Outlet />
            </main>

            {showFloatingButton && <FloatingButton />}
          </div>
        </SimulationProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}
