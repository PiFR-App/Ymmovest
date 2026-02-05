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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../services/api';
import { UserData } from '../types';

export function UsersManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserData | null>(null);
  const [formData, setFormData] = useState<Partial<UserData>>({});
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (error: any) {
      enqueueSnackbar('Erreur lors du chargement des utilisateurs', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: UserData) => {
    if (user) {
      setEditingUser(user);
      setFormData({ ...user, password: '' }); // Ne pas afficher le mot de passe
    } else {
      setEditingUser(null);
      setFormData({ role: 'admin' }); // Rôle par défaut
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.email) {
        enqueueSnackbar('L\'email est requis', { variant: 'error' });
        return;
      }
      if (!editingUser && !formData.password) {
        enqueueSnackbar('Le mot de passe est requis pour un nouvel utilisateur', { variant: 'error' });
        return;
      }

      // Préparer les données
      const dataToSend = { ...formData };
      // Si on modifie et qu'il n'y a pas de nouveau mot de passe, on l'enlève
      if (editingUser && !formData.password) {
        delete dataToSend.password;
      }

      if (editingUser) {
        await updateUser(editingUser.id!, dataToSend);
        enqueueSnackbar('Utilisateur modifié avec succès', { variant: 'success' });
      } else {
        await createUser(dataToSend);
        enqueueSnackbar('Utilisateur ajouté avec succès', { variant: 'success' });
      }
      handleCloseDialog();
      loadUsers();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Erreur lors de la sauvegarde', {
        variant: 'error',
      });
    }
  };

  const handleOpenDeleteDialog = (user: UserData) => {
    setDeletingUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeletingUser(null);
  };

  const handleDelete = async () => {
    if (!deletingUser?.id) return;
    try {
      await deleteUser(deletingUser.id);
      enqueueSnackbar('Utilisateur supprimé avec succès', { variant: 'success' });
      handleCloseDeleteDialog();
      loadUsers();
    } catch (error: any) {
      enqueueSnackbar(error.response?.data?.message || 'Erreur lors de la suppression', {
        variant: 'error',
      });
    }
  };

  const handleInputChange = (field: keyof UserData, value: any) => {
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
            Gestion des utilisateurs
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
            Ajouter un utilisateur
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
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Rôle</th>
                  <th style={{ ...thStyle, width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <td style={tdStyle}>{user.id}</td>
                    <td style={tdStyle}>{user.email}</td>
                    <td style={tdStyle}>
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-block',
                          px: 2,
                          py: 0.5,
                          borderRadius: '12px',
                          backgroundColor: user.role === 'admin' ? 'var(--accent)' : 'var(--muted)',
                          color: user.role === 'admin' ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
                          fontSize: '12px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}
                      >
                        {user.role}
                      </Box>
                    </td>
                    <td style={tdStyle}>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(user)}
                          sx={{
                            color: 'var(--accent)',
                            '&:hover': { backgroundColor: 'var(--secondary)' },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDeleteDialog(user)}
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
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle
            sx={{
              backgroundColor: 'var(--card)',
              color: 'var(--foreground)',
              fontWeight: 'bold',
            }}
          >
            {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: 'var(--card)', pt: 3 }}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label={editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                type="password"
                value={formData.password || ''}
                onChange={(e) => handleInputChange('password', e.target.value)}
                fullWidth
                required={!editingUser}
                helperText={editingUser ? 'Laisser vide pour conserver le mot de passe actuel' : ''}
              />
              <FormControl fullWidth required>
                <InputLabel>Rôle</InputLabel>
                <Select
                  value={formData.role || 'admin'}
                  label="Rôle"
                  onChange={(e) => handleInputChange('role', e.target.value)}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
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
              {editingUser ? 'Modifier' : 'Ajouter'}
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
              Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
              <strong>{deletingUser?.email}</strong> ?
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
