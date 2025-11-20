import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Autocomplete,
  Alert,
} from "@mui/material";
import {
  Search,
  TrendingUp,
  Shield,
  Speed,
  LocationOn,
  SquareFoot,
  Euro,
} from "@mui/icons-material";
import { searchCommunes, CommuneData } from "../data/prix-communes";
import { useSimulation } from "../contexts/SimulationContext";

export function Home() {
  const navigate = useNavigate();
  const { setSimulationData } = useSimulation();
  const [commune, setCommune] = useState<CommuneData | null>(null);
  const [surface, setSurface] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<CommuneData[]>([]);

  const handleInputChange = (_: any, newInputValue: string) => {
    setInputValue(newInputValue);
    if (newInputValue.length >= 2) {
      const results = searchCommunes(newInputValue);
      setOptions(results);
    } else {
      setOptions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commune && surface && parseFloat(surface) > 0) {
      const prixBien = commune.prixM2Median * parseFloat(surface);
      setSimulationData({ commune, surface: parseFloat(surface), prixBien });
      navigate("/dashboard");
    }
  };

  const handleExemple = () => {
    // Paris 11e, 65m²
    const exempleParis = searchCommunes("Paris 11")[0];
    if (exempleParis) {
      setCommune(exempleParis);
      setInputValue(exempleParis.nom);
      setSurface("65");
      const prixBien = exempleParis.prixM2Median * 65;
      setSimulationData({ commune: exempleParis, surface: 65, prixBien });
      setTimeout(() => navigate("/dashboard"), 300);
    }
  };

  const prixEstime = commune && surface && parseFloat(surface) > 0
    ? Math.round(commune.prixM2Median * parseFloat(surface))
    : null;

  const features = [
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: "secondary.main" }} />,
      title: "Données réelles",
      description: "Prix basés sur les transactions DVF publiques",
    },
    {
      icon: <Shield sx={{ fontSize: 40, color: "secondary.main" }} />,
      title: "Analyse complète",
      description: "Évaluez tous les risques et opportunités",
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: "secondary.main" }} />,
      title: "Résultats instantanés",
      description: "Obtenez vos simulations en quelques secondes",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 70px)",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%)"
            : "radial-gradient(ellipse at top, #f8fafc 0%, #ffffff 50%)",
        pt: { xs: 6, md: 10 },
        pb: 8,
      }}
    >
      <Container maxWidth="lg">
        <div>
          <Stack spacing={4} alignItems="center" textAlign="center" mb={6}>
            <Chip
              label="Simulateur d'investissement immobilier"
              sx={{
                bgcolor: "secondary.main",
                color: "secondary.contrastText",
                px: 2,
                py: 0.5,
              }}
            />

            <Typography
              variant="h2"
              sx={{
                maxWidth: 800,
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)"
                    : "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Simulez la rentabilité de votre futur investissement
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600 }}
            >
              Analysez instantanément le potentiel de n'importe quel bien
              immobilier avec des données de marché réelles
            </Typography>
          </Stack>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              maxWidth: 700,
              mx: "auto",
              mb: 6,
            }}
          >
            <Card
              elevation={0}
              sx={{
                border: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <Autocomplete
                    options={options}
                    getOptionLabel={(option) => 
                      `${option.nom} (${option.codePostal})`
                    }
                    value={commune}
                    onChange={(_, newValue) => setCommune(newValue)}
                    inputValue={inputValue}
                    onInputChange={handleInputChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Rechercher une ville (ex: Paris, Lyon, Marseille...)"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <LocationOn color="secondary" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(0, 0, 0, 0.02)",
                          },
                        }}
                      />
                    )}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Stack direction="row" justifyContent="space-between" width="100%">
                          <Stack>
                            <Typography variant="body1">
                              {option.nom}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.codePostal} • {option.nombreTransactions} transactions
                            </Typography>
                          </Stack>
                          <Stack alignItems="flex-end">
                            <Typography variant="body2" sx={{ color: "secondary.main" }}>
                              {option.prixM2Median.toLocaleString()} €/m²
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: option.evolution1An >= 0 ? "success.main" : "error.main" 
                              }}
                            >
                              {option.evolution1An >= 0 ? "+" : ""}{option.evolution1An}% / an
                            </Typography>
                          </Stack>
                        </Stack>
                      </Box>
                    )}
                    noOptionsText="Aucune ville trouvée. Essayez Paris, Lyon, Marseille..."
                    loadingText="Recherche..."
                  />

                  <TextField
                    fullWidth
                    type="number"
                    placeholder="Surface du bien (m²)"
                    value={surface}
                    onChange={(e) => setSurface(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SquareFoot color="secondary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2" color="text.secondary">
                            m²
                          </Typography>
                        </InputAdornment>
                      ),
                      inputProps: { min: 1, max: 500, step: 1 },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.05)"
                            : "rgba(0, 0, 0, 0.02)",
                      },
                    }}
                  />

                  {commune && prixEstime && (
                    <Alert 
                      severity="info" 
                      icon={<Euro />}
                      sx={{
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(212, 175, 55, 0.1)"
                            : "rgba(212, 175, 55, 0.05)",
                        border: 1,
                        borderColor: "secondary.main",
                        "& .MuiAlert-icon": {
                          color: "secondary.main",
                        },
                      }}
                    >
                      <Stack spacing={0.5}>
                        <Typography variant="body2">
                          <strong>Prix estimé du bien :</strong>{" "}
                          <span style={{ color: "#d4af37" }}>
                            {prixEstime.toLocaleString()} €
                          </span>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Basé sur {commune.prixM2Median.toLocaleString()} €/m² × {surface} m²
                          {" • "}
                          {commune.nombreTransactions} transactions enregistrées
                        </Typography>
                      </Stack>
                    </Alert>
                  )}

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="center"
                  >
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      color="secondary"
                      startIcon={<Search />}
                      disabled={!commune || !surface || parseFloat(surface) <= 0}
                      fullWidth
                      sx={{
                        py: 1.5,
                        fontSize: "1.1rem",
                      }}
                    >
                      Analyser le bien
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleExemple}
                      sx={{
                        py: 1.5,
                        borderColor: "divider",
                        color: "text.secondary",
                        "&:hover": {
                          borderColor: "secondary.main",
                          bgcolor: "transparent",
                        },
                      }}
                    >
                      Essayer un exemple
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Grid container spacing={4} mb={6}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <div>
                  <Card
                    sx={{
                      height: "100%",
                      border: 1,
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "secondary.main",
                        transform: "translateY(-8px)",
                        boxShadow: "0 12px 24px rgba(212, 175, 55, 0.15)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: "center" }}>
                      <Box mb={2}>{feature.icon}</Box>
                      <Typography variant="h6" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </div>
              </Grid>
            ))}
          </Grid>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary" mb={2}>
              Utilisé par plus de 10,000 investisseurs immobiliers
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              flexWrap="wrap"
            >
              {["Particuliers", "Agents immobiliers", "Courtiers", "Investisseurs"].map(
                (tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: "divider",
                      color: "text.secondary",
                    }}
                  />
                )
              )}
            </Stack>
          </Box>
        </div>
      </Container>
    </Box>
  );
}
