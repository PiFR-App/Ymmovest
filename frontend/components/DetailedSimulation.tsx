import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Stack,
  Chip,
  Paper,
  Divider,
  Slider,
} from "@mui/material";
import {
  ArrowBack,
  FileDownload,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useSimulation } from "../contexts/SimulationContext";
import {
  getTauxCreditImmobilier,
  estimerLoyer,
  estimerCharges,
  calculerMensualite,
  calculerProjection,
} from "../services/api-mock";

export function DetailedSimulation() {
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

  // États
  const [apport, setApport] = useState(Math.round(prixBien * 0.2));
  const [tauxCredit, setTauxCredit] = useState(3.5);
  const [duree, setDuree] = useState(20);
  const [loyerMensuel, setLoyerMensuel] = useState(0);
  const [chargesMensuelles, setChargesMensuelles] = useState(0);
  const [loading, setLoading] = useState(true);

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [taux, loyer, charges] = await Promise.all([
          getTauxCreditImmobilier(),
          estimerLoyer(commune, surface),
          estimerCharges(prixBien, surface),
        ]);

        setTauxCredit(taux.taux20ans);
        setLoyerMensuel(loyer.loyerMensuelMedian);
        setChargesMensuelles(charges.totalMensuel);
      } catch (error) {
        console.error("Erreur lors du chargement:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [commune, surface, prixBien]);

  // Calculs
  const montantEmprunte = prixBien - apport;
  const { mensualite: mensualiteCredit, mensualiteAvecAssurance } = calculerMensualite(
    montantEmprunte,
    tauxCredit,
    duree
  );

  const cashFlowMensuel = loyerMensuel - chargesMensuelles - mensualiteAvecAssurance;
  const cashFlowAnnuel = cashFlowMensuel * 12;
  const loyerAnnuel = loyerMensuel * 12;
  const chargesAnnuelles = chargesMensuelles * 12;
  const mensualitesAnnuelles = mensualiteAvecAssurance * 12;

  // Projection sur 10 ans
  const projection = calculerProjection(
    prixBien,
    apport,
    tauxCredit,
    duree,
    loyerMensuel,
    chargesMensuelles,
    commune.evolution1An,
    1.5
  );

  // Données pour les graphiques
  const revenusData = [
    { name: "Loyers annuels", value: loyerAnnuel, color: "#10b981" },
  ];

  const chargesDataPie = [
    { name: "Mensualités crédit", value: Math.round(mensualitesAnnuelles), color: "#ef4444" },
    { name: "Charges & Taxes", value: Math.round(chargesAnnuelles), color: "#f59e0b" },
  ];

  const revenusMensuels = [
    { libelle: "Loyer mensuel estimé", montant: loyerMensuel, type: "positif" },
  ];

  const chargesMensuellesDetail = [
    { libelle: "Mensualité de crédit (avec assurance)", montant: -mensualiteAvecAssurance, type: "negatif" },
    { libelle: "Charges totales (taxe, copro, assurance)", montant: -chargesMensuelles, type: "negatif" },
  ];

  const projectionChartData = projection.slice(0, 10).map((p) => ({
    annee: `An ${p.annee}`,
    cashFlowCumule: Math.round(p.cashFlowCumule),
    valeurBien: Math.round(p.valeurBienEstimee / 1000), // en k€
  }));

  if (loading) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 70px)", py: 4 }}>
        <Container maxWidth="xl">
          <Typography variant="h6" color="text.secondary" textAlign="center">
            Chargement des données détaillées...
          </Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 70px)", py: 4 }}>
      <Container maxWidth="xl">
        <div>
          <Box mb={4}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/dashboard")}
              sx={{ mb: 2, color: "text.secondary" }}
            >
              Retour au tableau de bord
            </Button>
            <Typography variant="h4" gutterBottom>
              Simulation financière détaillée
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {commune.nom} ({commune.codePostal}) • {surface}m² • {Math.round(prixBien).toLocaleString()} €
            </Typography>
          </Box>

          {/* Sliders de paramètres */}
          <Card sx={{ border: 1, borderColor: "divider", mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ajuster les paramètres
              </Typography>
              <Grid container spacing={4} mt={1}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Apport personnel</Typography>
                      <Typography variant="body2" sx={{ color: "secondary.main" }}>
                        {apport.toLocaleString()} € ({Math.round((apport / prixBien) * 100)}%)
                      </Typography>
                    </Box>
                    <Slider
                      value={apport}
                      onChange={(_, value) => setApport(value as number)}
                      min={0}
                      max={prixBien}
                      step={1000}
                      color="secondary"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Taux de crédit</Typography>
                      <Typography variant="body2" sx={{ color: "secondary.main" }}>
                        {tauxCredit.toFixed(2)} %
                      </Typography>
                    </Box>
                    <Slider
                      value={tauxCredit}
                      onChange={(_, value) => setTauxCredit(value as number)}
                      min={0.5}
                      max={6}
                      step={0.1}
                      color="secondary"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Durée du prêt</Typography>
                      <Typography variant="body2" sx={{ color: "secondary.main" }}>
                        {duree} ans
                      </Typography>
                    </Box>
                    <Slider
                      value={duree}
                      onChange={(_, value) => setDuree(value as number)}
                      min={5}
                      max={30}
                      step={1}
                      color="secondary"
                    />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ border: 1, borderColor: "divider", height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Répartition des revenus annuels
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={revenusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) =>
                            `${name}: ${value.toLocaleString()} €`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {revenusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => `${value.toLocaleString()} €`}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(16, 185, 129, 0.1)"
                          : "rgba(16, 185, 129, 0.05)",
                      border: 1,
                      borderColor: "#10b981",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TrendingUp sx={{ color: "#10b981" }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Total revenus annuels
                        </Typography>
                        <Typography variant="h6" sx={{ color: "#10b981" }}>
                          {loyerAnnuel.toLocaleString()} €
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ border: 1, borderColor: "divider", height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Répartition des charges annuelles
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={chargesDataPie}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {chargesDataPie.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => `${value.toLocaleString()} €`}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(239, 68, 68, 0.1)"
                          : "rgba(239, 68, 68, 0.05)",
                      border: 1,
                      borderColor: "#ef4444",
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TrendingDown sx={{ color: "#ef4444" }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Total charges annuelles
                        </Typography>
                        <Typography variant="h6" sx={{ color: "#ef4444" }}>
                          {(mensualitesAnnuelles + chargesAnnuelles).toFixed(0).toLocaleString()} €
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Projection sur 10 ans */}
          <Card sx={{ border: 1, borderColor: "divider", mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Projection sur 10 ans
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Évolution du cash flow cumulé et de la valeur du bien
              </Typography>
              <Box sx={{ width: "100%", height: 350 }}>
                <ResponsiveContainer>
                  <LineChart data={projectionChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="annee" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="cashFlowCumule"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Cash Flow cumulé (€)"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="valeurBien"
                      stroke="#d4af37"
                      strokeWidth={2}
                      name="Valeur bien (k€)"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ border: 1, borderColor: "divider", mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Détail des flux mensuels
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Libellé</TableCell>
                      <TableCell align="right">Montant mensuel</TableCell>
                      <TableCell align="right">Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenusMensuels.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.libelle}</TableCell>
                        <TableCell align="right">
                          <Typography sx={{ color: "#10b981" }}>
                            +{Math.round(row.montant).toLocaleString()} €
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label="Revenu"
                            size="small"
                            sx={{
                              bgcolor: "rgba(16, 185, 129, 0.1)",
                              color: "#10b981",
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {chargesMensuellesDetail.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.libelle}</TableCell>
                        <TableCell align="right">
                          <Typography sx={{ color: "#ef4444" }}>
                            {Math.round(row.montant).toLocaleString()} €
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label="Charge"
                            size="small"
                            sx={{
                              bgcolor: "rgba(239, 68, 68, 0.1)",
                              color: "#ef4444",
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Divider />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography>Cash Flow mensuel</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" sx={{ color: "#d4af37" }}>
                          {cashFlowMensuel > 0 ? "+" : ""}
                          {Math.round(cashFlowMensuel).toLocaleString()} €
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={cashFlowMensuel > 0 ? "Positif" : "Négatif"}
                          sx={{
                            bgcolor: "rgba(212, 175, 55, 0.1)",
                            color: "#d4af37",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<FileDownload />}
              onClick={() => navigate("/report")}
              fullWidth
            >
              Générer le rapport complet
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/dashboard")}
              fullWidth
              sx={{
                borderColor: "divider",
                color: "text.secondary",
                "&:hover": {
                  borderColor: "secondary.main",
                },
              }}
            >
              Retour au tableau de bord
            </Button>
          </Stack>
        </div>
      </Container>
    </Box>
  );
}
