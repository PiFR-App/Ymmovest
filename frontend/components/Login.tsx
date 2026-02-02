import { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Link,
  Stack,
  Snackbar,
} from "@mui/material";
import { Google as GoogleIcon } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { login } from "../services/api";
import { googleLogin } from "../services/api";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await login(email, password);

      if (response.success) {
        enqueueSnackbar(`Bienvenue ${response.user.email} !`, {
          variant: "success",
        });
        // TODO: Redirection vers le dashboard ou stockage du token
        localStorage.setItem("user", JSON.stringify(response.user));
        navigate("/admin");
      } else {
        enqueueSnackbar(response.message || "Connexion échouée", {
          variant: "error",
        });
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Erreur de connexion";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

    const handleSuccess = async (credentialResponse: any) => {
        try {
            const token = credentialResponse.credential;

            if (!token) {
                throw new Error("Token Google manquant");
            }

            const response = await googleLogin(token);

            localStorage.setItem("user", JSON.stringify(response.user));
            enqueueSnackbar(`Bienvenue ${response.user.email} !`, {
                variant: "success",
            });
            navigate("/admin");
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Erreur de connexion Google";
            enqueueSnackbar(message, { variant: "error" });
        }
    };



  const handleError = () => {
    enqueueSnackbar("Échec de la connexion Google", { variant: "error" });
  };

  const handleGithubLogin = () => {
    // Logique de connexion GitHub
    enqueueSnackbar("Login par Github...", { variant: "info" });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            padding: { xs: 4, sm: 6 },
            borderRadius: 3,
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Bienvenue sur l'administration Ymmovest
            </Typography>
            <Typography variant="body1" color="text.secondary">
              ⚠️ Accès réservé aux administrateurs ⚠️
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Connectez-vous pour continuer
            </Typography>
          </Box>

          {/* Boutons SSO */}
          <Stack spacing={2} mb={3}>
              <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => {
                      enqueueSnackbar("Erreur de connexion Google", { variant: "error" });
                  }}
                  useOneTap={false}
              />
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={
                <svg
                  style={{ width: 20, height: 20 }}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              }
              onClick={handleGithubLogin}
              sx={{
                textTransform: "none",
                py: 1.5,
                borderColor: "#333",
                color: "#333",
                "&:hover": {
                  borderColor: "#333",
                  backgroundColor: "#333",
                  color: "white",
                },
              }}
            >
              Continuer avec GitHub
            </Button>
          </Stack>

          {/* Séparateur */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              ou
            </Typography>
          </Divider>

          {/* Formulaire de connexion par email */}
          <Box component="form" onSubmit={handleEmailLogin}>
            <Stack spacing={3}>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                required
                fullWidth
                variant="outlined"
              />

              <TextField
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                fullWidth
                variant="outlined"
              />

              <Box display="flex" justifyContent="flex-end">
                <Link
                  href="#"
                  variant="body2"
                  sx={{
                    color: "#d4af37",
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  Mot de passe oublié ?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  py: 1.5,
                  backgroundColor: "#d4af37",
                  color: "#1e293b",
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#c49d2f",
                  },
                  "&:disabled": {
                    backgroundColor: "#e0e0e0",
                    color: "#9e9e9e",
                  },
                }}
              >
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </Stack>
          </Box>

          {/* Lien d'inscription */}
          <Box mt={4} pt={3} borderTop="1px solid" borderColor="divider">
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              Pas encore de compte ?{" "}
              <Link
                href="#"
                sx={{
                  color: "#d4af37",
                  textDecoration: "none",
                  fontWeight: 600,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Créer un compte
              </Link>
            </Typography>
          </Box>

          {/* Bypass dev */}
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => (window.location.href = "/admin")}
            sx={{
              textTransform: "none",
              py: 1.5,
              borderColor: "#333",
              color: "#333",
              "&:hover": {
                borderColor: "#333",
                backgroundColor: "#333",
                color: "white",
              },
            }}
          >
            Bypass dev
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
