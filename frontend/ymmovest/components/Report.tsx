import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
} from "@mui/material";
import {
  ArrowBack,
  Download,
  CheckCircle,
  Description,
  Star,
  Lock,
} from "@mui/icons-material";
import { useSimulation } from "../contexts/SimulationContext";

export function Report() {
  const navigate = useNavigate();
  const { simulationData } = useSimulation();

  // Rediriger vers l'accueil si pas de données
  useEffect(() => {
    if (!simulationData) {
      navigate("/");
    }
  }, [simulationData, navigate]);

  if (!simulationData) {
    return null;
  }
  const { commune, surface, prixBien } = simulationData;
  const reportSections = [
    "Synthèse de l'investissement",
    "Analyse de rentabilité détaillée",
    "Simulation de trésorerie sur 20 ans",
    "Indicateurs de performance",
    "Recommandations personnalisées",
  ];

  const premiumFeatures = [
    "Rapports illimités",
    "Comparaison de plusieurs biens",
    "Simulation fiscale avancée",
    "Alertes de marché",
    "Support prioritaire",
  ];

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 70px)", py: 4 }}>
      <Container maxWidth="lg">
        <div>
          <Box mb={4}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/simulation")}
              sx={{ mb: 2, color: "text.secondary" }}
            >
              Retour à la simulation
            </Button>
            <Typography variant="h4" gutterBottom>
              Rapport d'investissement
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Téléchargez votre rapport complet d'analyse immobilière
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card
                sx={{
                  border: 1,
                  borderColor: "divider",
                  mb: 3,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={3}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 3,
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(212, 175, 55, 0.1)"
                            : "rgba(212, 175, 55, 0.05)",
                        borderRadius: 2,
                        border: 1,
                        borderColor: "secondary.main",
                      }}
                    >
                      <Description sx={{ fontSize: 48, color: "secondary.main" }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          Rapport Ymmovest Premium
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Analyse complète - {commune.nom} • {surface}m² • {Math.round(prixBien).toLocaleString()} €
                        </Typography>
                      </Box>
                      <Chip
                        icon={<Star />}
                        label="Premium"
                        sx={{
                          bgcolor: "secondary.main",
                          color: "secondary.contrastText",
                        }}
                      />
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Contenu du rapport
                      </Typography>
                      <List>
                        {reportSections.map((section, index) => (
                          <ListItem key={index} disablePadding sx={{ py: 1 }}>
                            <ListItemIcon>
                              <CheckCircle sx={{ color: "secondary.main" }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={section}
                              primaryTypographyProps={{
                                color: "text.primary",
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(59, 130, 246, 0.1)"
                            : "rgba(59, 130, 246, 0.05)",
                        border: 1,
                        borderColor: "#3b82f6",
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Format de téléchargement
                      </Typography>
                      <Stack direction="row" spacing={2} mt={1}>
                        <Chip label="PDF" variant="outlined" />
                        <Chip label="Excel" variant="outlined" />
                        <Chip label="PowerPoint" variant="outlined" disabled />
                      </Stack>
                    </Paper>

                    <Stack spacing={2}>
                      <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        startIcon={<Download />}
                        fullWidth
                      >
                        Télécharger le rapport PDF
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<Download />}
                        fullWidth
                        sx={{
                          borderColor: "divider",
                          color: "text.secondary",
                          "&:hover": {
                            borderColor: "secondary.main",
                          },
                        }}
                      >
                        Télécharger en Excel
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card
                sx={{
                  border: 1,
                  borderColor: "divider",
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(100, 116, 139, 0.1)"
                      : "rgba(100, 116, 139, 0.05)",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Lock sx={{ color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      Version gratuite : 3 simulations restantes ce mois-ci
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Passez à Premium pour des simulations illimitées et des
                    fonctionnalités avancées
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  border: 2,
                  borderColor: "secondary.main",
                  position: "relative",
                  overflow: "visible",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                  }}
                >
                  <Chip
                    icon={<Star />}
                    label="Offre Premium"
                    sx={{
                      bgcolor: "secondary.main",
                      color: "secondary.contrastText",
                      px: 2,
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 3, pt: 4 }}>
                  <Stack spacing={3} textAlign="center">
                    <Box>
                      <Typography variant="h3" sx={{ color: "secondary.main" }}>
                        29€
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        par mois
                      </Typography>
                    </Box>

                    <Divider />

                    <Box textAlign="left">
                      <Typography variant="h6" gutterBottom>
                        Fonctionnalités Premium
                      </Typography>
                      <List>
                        {premiumFeatures.map((feature, index) => (
                          <ListItem key={index} disablePadding sx={{ py: 1 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircle
                                sx={{ fontSize: 20, color: "secondary.main" }}
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={feature}
                              primaryTypographyProps={{
                                variant: "body2",
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      fullWidth
                    >
                      Passer à Premium
                    </Button>

                    <Typography variant="caption" color="text.secondary">
                      Essai gratuit de 14 jours • Annulation à tout moment
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </div>
      </Container>
    </Box>
  );
}