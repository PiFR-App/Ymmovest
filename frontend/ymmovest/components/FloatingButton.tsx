import { Fab, Tooltip } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export function FloatingButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/");
  };
  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 1000,
      }}
    >
      <Tooltip title="Nouvelle simulation" placement="left">
        <Fab
          color="secondary"
          onClick={handleClick}
          sx={{
            width: 64,
            height: 64,
            boxShadow: "0 8px 24px rgba(212, 175, 55, 0.3)",
            "&:hover": {
              transform: "scale(1.1)",
              boxShadow: "0 12px 32px rgba(212, 175, 55, 0.4)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <Add sx={{ fontSize: 32 }} />
        </Fab>
      </Tooltip>
    </div>
  );
}
