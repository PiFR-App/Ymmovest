// Types centralisés pour l'application Ymmovest

export interface CommuneData {
  id?: number;
  code: string;
  nom: string;
  codePostal: string;
  prixM2Median: number;
  prixM2Min: number;
  prixM2Max: number;
  evolution1An: number; // en %
  nombreTransactions: number;
  loyerM2Median: number;
}
export type { SimulationData } from "../contexts/SimulationContext";
export type {
  TauxCreditData,
  LoyerEstime,
  ChargesEstimees,
  ProjectionAnnuelle,
} from "../services/api-mock";
