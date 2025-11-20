// Hook personnalisé pour persister les données de simulation dans localStorage
// Optionnel : utilisez ce hook si vous voulez que les données survivent au rafraîchissement

import { useEffect } from "react";
import { useSimulation } from "../contexts/SimulationContext";

const STORAGE_KEY = "ymmovest_simulation_data";

export function usePersistedSimulation() {
  const { simulationData, setSimulationData } = useSimulation();

  // Charger les données du localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && !simulationData) {
      try {
        const parsed = JSON.parse(stored);
        setSimulationData(parsed);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [simulationData, setSimulationData]);

  // Sauvegarder les données dans localStorage quand elles changent
  useEffect(() => {
    if (simulationData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(simulationData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [simulationData]);

  // Fonction pour effacer les données
  const clearSimulation = () => {
    setSimulationData(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    simulationData,
    setSimulationData,
    clearSimulation,
  };
}

// Utilisation dans RootLayout.tsx ou dans App.tsx :
// 
// import { usePersistedSimulation } from '../hooks/usePersistedSimulation';
// 
// export default function RootLayout() {
//   usePersistedSimulation(); // Active la persistance
//   
//   return (
//     // ... votre layout
//   );
// }
