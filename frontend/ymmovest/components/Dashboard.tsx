import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Slider,
  Stack,
  Chip,
  Button,
  Divider,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  TrendingUp,
  Assessment,
  Home as HomeIcon,
  Euro,
  ArrowForward,
  Info,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
// import { motion } from "@motionone/react";
import { useSimulation } from "../contexts/SimulationContext";
import {
  getTauxCreditImmobilier,
  estimerLoyer,
  estimerCharges,
  calculerMensualite,
  calculerProjection,
  TauxCreditData,
  LoyerEstime,
  ChargesEstimees,
} from "../services/api-mock";

export function Dashboard() {
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

  // États pour les données API
  const [loading, setLoading] = useState(true);
  const [tauxData, setTauxData] = useState<TauxCreditData | null>(null);
  const [loyerData, setLoyerData] = useState<LoyerEstime | null>(null);
  const [chargesData, setChargesData] = useState<ChargesEstimees | null>(null);

  // États pour les sliders
  const [apport, setApport] = useState(Math.round(prixBien * 0.2)); // 20% par défaut
  const [tauxCredit, setTauxCredit] = useState(3.5);
  const [duree, setDuree] = useState(20);

  // Chargement des données API au montage
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [taux, loyer, charges] = await Promise.all([
          getTauxCreditImmobilier(),
          estimerLoyer(commune, surface),
          estimerCharges(prixBien, surface),
        ]);

        setTauxData(taux);
        setLoyerData(loyer);
        setChargesData(charges);
        setTauxCredit(taux.taux20ans); // Utiliser le taux réel pour 20 ans
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [commune, surface, prixBien]);

  // Calculs
  const loyerMensuel = loyerData?.loyerMensuelMedian || 0;
  const chargesMensuelles = chargesData?.totalMensuel || 0;
  const montantEmprunte = prixBien - apport;
  const { mensualite: mensualiteCredit, mensualiteAvecAssurance } = calculerMensualite(
    montantEmprunte,
    tauxCredit,
    duree
  );

  const cashFlowMensuel = loyerMensuel - chargesMensuelles - mensualiteAvecAssurance;
  const loyerAnnuel = loyerMensuel * 12;
  const chargesAnnuelles = chargesMensuelles * 12;
  const rentabiliteBrute = ((loyerAnnuel / prixBien) * 100).toFixed(2);
  const rentabiliteNette = (((loyerAnnuel - chargesAnnuelles) / prixBien) * 100).toFixed(2);

  // Projection sur 5 ans
  const projection = calculerProjection(
    prixBien,
    apport,
    tauxCredit,
    duree,
    loyerMensuel,
    chargesMensuelles,
    commune.evolution1An, // Évolution prix basée sur les données réelles
    1.5 // Évolution loyer
  );

  const chartData = projection.slice(0, 5).map((p) => ({
    annee: `An ${p.annee}`,
    rendement: parseFloat(
      (((loyerMensuel * 12 * Math.pow(1.015, p.annee - 1)) / prixBien) * 100).toFixed(2)
    ),
    cashFlow: Math.round(p.cashFlow / 12), // Cash flow mensuel
  }));

  const stats = [
    {
      label: "Prix du bien",
      value: `${Math.round(prixBien).toLocaleString()} €`,
      icon: <HomeIcon />,
      color: "#3b82f6",
      detail: `${surface}m² à ${commune.prixM2Median.toLocaleString()} €/m²`,
    },
    {
      label: "Loyer mensuel estimé",
      value: `${loyerMensuel.toLocaleString()} €`,
      icon: <Euro />,
      color: "#10b981",
      detail: loyerData
        ? `Entre ${loyerData.loyerMensuelMin} € et ${loyerData.loyerMensuelMax} €`
        : "",
    },
    {
      label: "Rentabilité brute",
      value: `${rentabiliteBrute}%`,
      icon: <TrendingUp />,
      color: "#d4af37",
      badge: parseFloat(rentabiliteBrute) > 5 ? "Bon rendement" : parseFloat(rentabiliteBrute) > 3 ? "Rendement moyen" : "Faible rendement",
      detail: `Nette : ${rentabiliteNette}%`,
    },
    {
      label: "Cash flow mensuel",
      value: `${cashFlowMensuel.toFixed(0)} €`,
      icon: <Assessment />,
      color: cashFlowMensuel > 0 ? "#10b981" : "#ef4444",
      badge: cashFlowMensuel > 0 ? "Positif" : "Négatif",
      detail: `Avec assurance emprunteur`,
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "calc(100vh - 70px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={60} sx={{ color: "secondary.main" }} />
          <Typography variant="h6" color="text.secondary">
            Analyse du marché en cours...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Récupération des données DVF et taux de crédit
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 70px)", py: 4 }}>
      <Container maxWidth="xl">
        <div>
          <Box mb={4}>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <Typography variant="h4">Tableau de bord</Typography>
              <Chip
                label={`+${commune.evolution1An}% / an`}
                size="small"
                sx={{
                  bgcolor: commune.evolution1An >= 0 ? "success.main" : "error.main",
                  color: "white",
                }}
              />
            </Stack>
            <Typography variant="body1" color="text.secondary">
              {commune.nom} ({commune.codePostal}) • {surface}m²
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Données basées sur {commune.nombreTransactions} transactions • Taux BdF actualisé
            </Typography>
          </Box>

          {tauxData && (
            <Alert
              severity="info"
              icon={<Info />}
              sx={{ mb: 3 }}
            >
              <Typography variant="body2">
                Taux de crédit immobilier moyen : <strong>{tauxData.tauxMoyen}%</strong> (Source : Banque de France - {tauxData.date})
              </Typography>
            </Alert>
          )}

          <Grid container spacing={3} mb={4}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} lg={3} key={index}>
                <div>
                  <Card
                    sx={{
                      height: "100%",
                      border: 1,
                      borderColor: "divider",
                      position: "relative",
                      overflow: "visible",
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: `${stat.color}20`,
                            color: stat.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {stat.icon}
                        </Box>
                        {stat.badge && (
                          <Chip
                            label={stat.badge}
                            size="small"
                            sx={{
                              bgcolor: `${stat.color}20`,
                              color: stat.color,
                              border: `1px solid ${stat.color}40`,
                            }}
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {stat.label}
                      </Typography>
                      <Typography variant="h5" gutterBottom>
                        {stat.value}
                      </Typography>
                      {stat.detail && (
                        <Typography variant="caption" color="text.secondary">
                          {stat.detail}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Card sx={{ border: 1, borderColor: "divider" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Projection sur 5 ans
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Évolution du rendement et du cash flow mensuel
                  </Typography>
                  <Box sx={{ width: "100%", height: 350, mt: 3 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData}>
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
                        <Bar dataKey="rendement" fill="#d4af37" name="Rendement (%)" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="cashFlow" fill="#3b82f6" name="Cash Flow (€/mois)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Card sx={{ border: 1, borderColor: "divider", height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Paramètres de simulation
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Ajustez les paramètres pour affiner votre simulation
                  </Typography>

                  <Stack spacing={4}>
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
                        max={10}
                        step={0.1}
                        color="secondary"
                        />
                    </Box>

                  </Stack>
                </CardContent>
                </Card>
            </Grid>
            </Grid>
        </div>
        </Container>
    </Box>
  );}

