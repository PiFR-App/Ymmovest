import { createContext, useContext, useState, ReactNode } from "react";
import { CommuneData } from "../types";

export interface SimulationData {
  commune: CommuneData;
  surface: number;
  prixBien: number;
}

interface SimulationContextType {
  simulationData: SimulationData | null;
  setSimulationData: (data: SimulationData | null) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);

  return (
    <SimulationContext.Provider value={{ simulationData, setSimulationData }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
}
