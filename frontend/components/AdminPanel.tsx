import { Box, Container, Typography, Button } from '@mui/material';
import { LocationCity, Settings, Api, People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';

export function AdminPanel() {
  const navigate = useNavigate();

  const buttons = [
    {
      title: 'Gestion des communes',
      icon: <LocationCity sx={{ fontSize: 80 }} />,
      color: '#3b82f6',
      action: () => navigate('/admin/communes'),
    },
    {
      title: 'Gestion des utilisateurs',
      icon: <People sx={{ fontSize: 80 }} />,
      color: '#10b981',
      action: () => navigate('/admin/users'),
    },
    {
      title: 'Swagger API',
      icon: <Api sx={{ fontSize: 80 }} />,
      color: '#f59e0b',
      action: () => navigate('/docs'),
    },
    {
      title: 'Paramètres',
      icon: <Settings sx={{ fontSize: 80 }} />,
      color: '#8b5cf6',
      action: () => navigate('#'),
    },
  ];

  return (
    <Box className="min-h-screen bg-background">
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 'bold',
            color: 'var(--foreground)',
            textAlign: 'center',
            mb: 6,
          }}
        >
          Panneau d'administration
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 4,
          }}
        >
          {buttons.map((button, index) => (
            <Button
              key={index}
              onClick={button.action}
              sx={{
                height: '280px',
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
                backgroundColor: 'var(--card)',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 12px 24px ${button.color}40`,
                  borderColor: button.color,
                  backgroundColor: 'var(--card)',
                },
              }}
            >
              <Box sx={{ color: button.color }}>{button.icon}</Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: 'var(--foreground)',
                  textTransform: 'none',
                }}
              >
                {button.title}
              </Typography>
            </Button>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
