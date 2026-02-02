import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import {
  getAllCommunes,
  createCommune,
  updateCommune,
  deleteCommune,
} from '../services/api';
import { CommuneData } from '../types';

export function CitiesManagement() {
  const [communes, setCommunes] = useState<CommuneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingCommune, setEditingCommune] = useState<CommuneData | null>(null);
  const [deletingCommune, setDeletingCommune] = useState<CommuneData | null>(null);
  const [formData, setFormData] = useState<Partial<CommuneData>>({});
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    loadCommunes();
  }, []);

  const loadCommunes = async () => {
    try {
      setLoading(true);
      const data = await getAllCommunes();
      setCommunes(data);
    } catch (error: any) {
      enqueueSnackbar('Erreur lors du chargement des communes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (commune?: CommuneData) => {
    if (commune) {
      setEditingCommune(commune);
      setFormData(commune);
    } else {
      setEditingCommune(null);
      setFormData({});
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCommune(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      if (editingCommune) {
        await updateCommune(editingCommune.id!, formData);
        enqueueSnackbar('Commune modifiée avec succès', { variant: 'success' });
      } else {
        await createCommune(formData);
        enqueueSnackbar('Commune ajoutée avec succès', { variant: 'success' });
      }
      handleCloseDialog();
      loadCommunes();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Erreur lors de la sauvegarde', {
        variant: 'error',
      });
    }
  };

  const handleOpenDeleteDialog = (commune: CommuneData) => {
    setDeletingCommune(commune);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeletingCommune(null);
  };

  const handleDelete = async () => {
    if (!deletingCommune?.id) return;
    try {
      await deleteCommune(deletingCommune.id);
      enqueueSnackbar('Commune supprimée avec succès', { variant: 'success' });
      handleCloseDeleteDialog();
      loadCommunes();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Erreur lors de la suppression', {
        variant: 'error',
      });
    }
  };

  const handleInputChange = (field: keyof CommuneData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Box className="min-h-screen bg-background flex items-center justify-center">
        <Typography>Chargement...</Typography>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-background">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: 'var(--accent)',
              '&:hover': { backgroundColor: 'var(--secondary)' },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: 'var(--foreground)',
              flex: 1,
            }}
          >
            Gestion des communes
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
            sx={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-foreground)',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: 'var(--accent)',
                opacity: 0.9,
              },
            }}
          >
            Ajouter une commune
          </Button>
        </Box>

        {/* Table */}
        <Box
          sx={{
            backgroundColor: 'var(--card)',
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--muted)' }}>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Code</th>
                  <th style={thStyle}>Nom</th>
                  <th style={thStyle}>Code Postal</th>
                  <th style={thStyle}>Prix M² Médian</th>
                  <th style={thStyle}>Prix M² Min</th>
                  <th style={thStyle}>Prix M² Max</th>
                  <th style={thStyle}>Évolution 1 an</th>
                  <th style={thStyle}>Nb Transactions</th>
                  <th style={thStyle}>Loyer M² Médian</th>
                  <th style={{ ...thStyle, width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {communes.map((commune) => (
                  <tr
                    key={commune.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <td style={tdStyle}>{commune.id}</td>
                    <td style={tdStyle}>{commune.code}</td>
                    <td style={tdStyle}>{commune.nom}</td>
                    <td style={tdStyle}>{commune.codePostal}</td>
                    <td style={tdStyle}>{commune.prixM2Median?.toFixed(2)} €</td>
                    <td style={tdStyle}>{commune.prixM2Min?.toFixed(2)} €</td>
                    <td style={tdStyle}>{commune.prixM2Max?.toFixed(2)} €</td>
                    <td style={tdStyle}>{commune.evolution1An?.toFixed(2)} %</td>
                    <td style={tdStyle}>{commune.nombreTransactions}</td>
                    <td style={tdStyle}>{commune.loyerM2Median?.toFixed(2)} €</td>
                    <td style={tdStyle}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(commune)}
                          sx={{
                            color: 'var(--accent)',
                            '&:hover': { backgroundColor: 'var(--secondary)' },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteDialog(commune)}
                          sx={{
                            color: 'var(--destructive)',
                            '&:hover': { backgroundColor: 'var(--secondary)' },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </Box>

        {/* Dialog d'édition/création */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle
            sx={{
              backgroundColor: 'var(--card)',
              color: 'var(--foreground)',
              fontWeight: 'bold',
            }}
          >
            {editingCommune ? 'Modifier la commune' : 'Ajouter une commune'}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: 'var(--card)', pt: 3 }}>
            <Stack spacing={2}>
              <TextField
                label="Code"
                value={formData.code || ''}
                onChange={(e) => handleInputChange('code', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Nom"
                value={formData.nom || ''}
                onChange={(e) => handleInputChange('nom', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Code Postal"
                value={formData.codePostal || ''}
                onChange={(e) => handleInputChange('codePostal', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Prix M² Médian (€)"
                type="number"
                value={formData.prixM2Median || ''}
                onChange={(e) => handleInputChange('prixM2Median', parseFloat(e.target.value))}
                fullWidth
                required
              />
              <TextField
                label="Prix M² Min (€)"
                type="number"
                value={formData.prixM2Min || ''}
                onChange={(e) => handleInputChange('prixM2Min', parseFloat(e.target.value))}
                fullWidth
                required
              />
              <TextField
                label="Prix M² Max (€)"
                type="number"
                value={formData.prixM2Max || ''}
                onChange={(e) => handleInputChange('prixM2Max', parseFloat(e.target.value))}
                fullWidth
                required
              />
              <TextField
                label="Évolution 1 an (%)"
                type="number"
                value={formData.evolution1An || ''}
                onChange={(e) => handleInputChange('evolution1An', parseFloat(e.target.value))}
                fullWidth
                required
              />
              <TextField
                label="Nombre de transactions"
                type="number"
                value={formData.nombreTransactions || ''}
                onChange={(e) => handleInputChange('nombreTransactions', parseInt(e.target.value))}
                fullWidth
                required
              />
              <TextField
                label="Loyer M² Médian (€)"
                type="number"
                value={formData.loyerM2Median || ''}
                onChange={(e) => handleInputChange('loyerM2Median', parseFloat(e.target.value))}
                fullWidth
                required
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: 'var(--card)', p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: 'var(--muted-foreground)' }}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              sx={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-foreground)',
                '&:hover': {
                  backgroundColor: 'var(--accent)',
                  opacity: 0.9,
                },
              }}
            >
              {editingCommune ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog de confirmation de suppression */}
        <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
          <DialogTitle
            sx={{
              backgroundColor: 'var(--card)',
              color: 'var(--foreground)',
              fontWeight: 'bold',
            }}
          >
            Confirmer la suppression
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: 'var(--card)', pt: 3 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Cette action est irréversible !
            </Alert>
            <Typography sx={{ color: 'var(--foreground)' }}>
              Êtes-vous sûr de vouloir supprimer la commune{' '}
              <strong>{deletingCommune?.nom}</strong> ?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: 'var(--card)', p: 2 }}>
            <Button onClick={handleCloseDeleteDialog} sx={{ color: 'var(--muted-foreground)' }}>
              Annuler
            </Button>
            <Button
              onClick={handleDelete}
              variant="contained"
              sx={{
                backgroundColor: 'var(--destructive)',
                color: 'var(--destructive-foreground)',
                '&:hover': {
                  backgroundColor: 'var(--destructive)',
                  opacity: 0.9,
                },
              }}
            >
              Supprimer
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontWeight: 600,
  fontSize: '14px',
  color: 'var(--foreground)',
  borderBottom: '2px solid var(--border)',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px',
  color: 'var(--foreground)',
};
