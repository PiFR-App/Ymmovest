import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  Container,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Home,
  Dashboard as DashboardIcon,
  Assessment,
  Description,
} from "@mui/icons-material";

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  currentView: string;
}

export function Header({ darkMode, toggleDarkMode, currentView }: HeaderProps) {
  const viewLabels: Record<string, string> = {
    home: "Accueil",
    dashboard: "Tableau de bord",
    details: "Simulation détaillée",
    report: "Rapport",
  };

  const viewIcons: Record<string, JSX.Element> = {
    home: <Home sx={{ fontSize: 18, mr: 0.5 }} />,
    dashboard: <DashboardIcon sx={{ fontSize: 18, mr: 0.5 }} />,
    details: <Assessment sx={{ fontSize: 18, mr: 0.5 }} />,
    report: <Description sx={{ fontSize: 18, mr: 0.5 }} />,
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: "space-between", py: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  background:
                    "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#d4af37",
                }}
              >
                <DashboardIcon />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  background: darkMode
                    ? "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)"
                    : "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Ymmovest
              </Typography>
            </Box>

            {currentView !== "home" && (
              <Breadcrumbs sx={{ display: { xs: "none", md: "flex" } }}>
                <Link
                  underline="hover"
                  color="text.secondary"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  {viewIcons[currentView]}
                  {viewLabels[currentView]}
                </Link>
              </Breadcrumbs>
            )}
          </Box>

          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: "none", mr: 2 }}
            onClick={() => (window.location.href = "/login")}
          >
            Connexion
          </Button>
          <Button
            variant="outlined"
            sx={{
              textTransform: "none",
              py: 1.5,
              borderColor: "#ea4335",
              color: "#ea4335",
              "&:hover": {
                borderColor: "#ea4335",
                backgroundColor: "#ea4335",
                color: "white",
              },
            }}
            onClick={() => (window.location.href = "/login")}
          >
            Déconnexion
          </Button>

          <IconButton
            onClick={toggleDarkMode}
            color="inherit"
            sx={{ color: "text.primary" }}
          >
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
