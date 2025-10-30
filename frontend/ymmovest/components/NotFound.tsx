import { Container, Box, Typography, Button, Stack } from "@mui/material";
import { Home, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 70px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="sm">
        <div>
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "4rem", md: "6rem" },
                  background: (theme) =>
                    theme.palette.mode === "dark"
                      ? "linear-gradient(135deg, #d4af37 0%, #f0d98d 100%)"
                      : "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                404
              </Typography>
              <Typography variant="h4" gutterBottom>
                Page non trouvée
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                startIcon={<Home />}
                onClick={() => navigate("/")}
              >
                Retour à l'accueil
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{
                  borderColor: "divider",
                  color: "text.secondary",
                  "&:hover": {
                    borderColor: "secondary.main",
                  },
                }}
              >
                Page précédente
              </Button>
            </Stack>
          </Stack>
        </div>
      </Container>
    </Box>
  );
}
