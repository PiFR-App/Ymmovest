// Service mock qui simule les appels aux APIs publiques françaises, étant restreintes nous avons simulé un jeu de données.
import { CommuneData } from "../types";

// Simule l'API Webstat de la Banque de France pour les taux de crédit immobilier
export interface TauxCreditData {
  date: string;
  tauxMoyen: number;
  taux10ans: number;
  taux15ans: number;
  taux20ans: number;
  taux25ans: number;
  source: string;
}

export async function getTauxCreditImmobilier(): Promise<TauxCreditData> {
  // Simulation d'un délai réseau
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Données mockées basées sur les taux moyens de 2024-2025
  return {
    date: "2025-10",
    tauxMoyen: 3.5,
    taux10ans: 3.2,
    taux15ans: 3.4,
    taux20ans: 3.5,
    taux25ans: 3.7,
    source: "Banque de France - Webstat (simulé)",
  };
}

// Simule l'API DVF+ pour obtenir des statistiques sur les transactions
export interface TransactionStats {
  prixMoyenM2: number;
  nombreVentes: number;
  prixMin: number;
  prixMax: number;
  surfaceMoyenne: number;
  evolution1An: number;
}

export async function getTransactionStats(
  commune: CommuneData,
  typeBien: "appartement" | "maison" = "appartement"
): Promise<TransactionStats> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Ajustement selon le type de bien
  const facteurType = typeBien === "maison" ? 0.85 : 1;
  
  return {
    prixMoyenM2: Math.round(commune.prixM2Median * facteurType),
    nombreVentes: commune.nombreTransactions,
    prixMin: Math.round(commune.prixM2Min * facteurType),
    prixMax: Math.round(commune.prixM2Max * facteurType),
    surfaceMoyenne: typeBien === "maison" ? 95 : 58,
    evolution1An: commune.evolution1An,
  };
}

// Simule le calcul de loyer estimé
export interface LoyerEstime {
  loyerMensuelMin: number;
  loyerMensuelMedian: number;
  loyerMensuelMax: number;
  rendementBrutEstime: number;
  source: string;
}

export async function estimerLoyer(
  commune: CommuneData,
  surface: number
): Promise<LoyerEstime> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const loyerM2 = commune.loyerM2Median;
  const loyerMensuelMedian = Math.round(loyerM2 * surface);
  
  return {
    loyerMensuelMin: Math.round(loyerMensuelMedian * 0.85),
    loyerMensuelMedian: loyerMensuelMedian,
    loyerMensuelMax: Math.round(loyerMensuelMedian * 1.15),
    rendementBrutEstime: (loyerM2 * 12 / commune.prixM2Median) * 100,
    source: "Baromètre des loyers (simulé)",
  };
}

// Simule l'estimation des charges
export interface ChargesEstimees {
  taxeFonciere: number;
  chargesCopropriete: number;
  assurancePNO: number;
  fraisGestion: number;
  totalMensuel: number;
  totalAnnuel: number;
}

export async function estimerCharges(
  prixBien: number,
  surface: number,
  typeBien: "appartement" | "maison" = "appartement"
): Promise<ChargesEstimees> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Estimations basées sur des moyennes nationales
  const taxeFonciere = Math.round(prixBien * 0.012); // ~1.2% du prix du bien par an
  const chargesCopropriete = typeBien === "appartement" ? surface * 30 * 12 : 0; // 30€/m²/an
  const assurancePNO = Math.round(prixBien * 0.001); // ~0.1% par an
  const fraisGestion = 0; // Sera calculé si gestion locative
  
  const totalAnnuel = taxeFonciere + chargesCopropriete + assurancePNO + fraisGestion;
  
  return {
    taxeFonciere,
    chargesCopropriete,
    assurancePNO,
    fraisGestion,
    totalMensuel: Math.round(totalAnnuel / 12),
    totalAnnuel,
  };
}

// Simule un calcul de mensualité de crédit
export interface MensualiteCredit {
  mensualite: number;
  coutTotal: number;
  coutCredit: number;
  tauxAssurance: number;
  mensualiteAvecAssurance: number;
}

export function calculerMensualite(
  montantEmprunte: number,
  tauxAnnuel: number,
  dureeAnnees: number,
  tauxAssurance: number = 0.3
): MensualiteCredit {
  const tauxMensuel = tauxAnnuel / 100 / 12;
  const nombreMois = dureeAnnees * 12;
  
  let mensualite: number;
  if (tauxMensuel === 0) {
    mensualite = montantEmprunte / nombreMois;
  } else {
    mensualite = (montantEmprunte * tauxMensuel) / (1 - Math.pow(1 + tauxMensuel, -nombreMois));
  }
  
  const assuranceMensuelle = (montantEmprunte * (tauxAssurance / 100)) / 12;
  const mensualiteAvecAssurance = mensualite + assuranceMensuelle;
  const coutTotal = mensualite * nombreMois;
  const coutCredit = coutTotal - montantEmprunte;
  
  return {
    mensualite: Math.round(mensualite),
    coutTotal: Math.round(coutTotal),
    coutCredit: Math.round(coutCredit),
    tauxAssurance,
    mensualiteAvecAssurance: Math.round(mensualiteAvecAssurance),
  };
}

// Simule une projection sur plusieurs années
export interface ProjectionAnnuelle {
  annee: number;
  loyersPerçus: number;
  chargesPayees: number;
  mensualitesCredit: number;
  cashFlow: number;
  cashFlowCumule: number;
  capitalRestantDu: number;
  valeurBienEstimee: number;
  plusValueLatente: number;
}

export function calculerProjection(
  prixBien: number,
  apport: number,
  tauxCredit: number,
  duree: number,
  loyerMensuel: number,
  chargesMensuelles: number,
  evolutionPrixAnnuelle: number = 2.5,
  evolutionLoyerAnnuelle: number = 1.5
): ProjectionAnnuelle[] {
  const montantEmprunte = prixBien - apport;
  const { mensualite } = calculerMensualite(montantEmprunte, tauxCredit, duree);
  
  const projection: ProjectionAnnuelle[] = [];
  let cashFlowCumule = -apport; // L'apport initial est une sortie de trésorerie
  let capitalRestant = montantEmprunte;
  const tauxMensuel = tauxCredit / 100 / 12;
  
  for (let annee = 1; annee <= Math.min(duree, 25); annee++) {
    // Évolution du loyer
    const loyerAnnee = loyerMensuel * Math.pow(1 + evolutionLoyerAnnuelle / 100, annee - 1);
    const chargesAnnee = chargesMensuelles * Math.pow(1 + 1.5 / 100, annee - 1); // Charges évoluent à 1.5%/an
    
    // Calcul du capital remboursé dans l'année
    let capitalRembourseAnnee = 0;
    for (let mois = 0; mois < 12 && capitalRestant > 0; mois++) {
      const interets = capitalRestant * tauxMensuel;
      const capitalMois = Math.min(mensualite - interets, capitalRestant);
      capitalRembourseAnnee += capitalMois;
      capitalRestant -= capitalMois;
    }
    
    const loyersPerçus = Math.round(loyerAnnee * 12);
    const chargesPayees = Math.round(chargesAnnee * 12);
    const mensualitesCredit = Math.round(mensualite * 12);
    const cashFlow = loyersPerçus - chargesPayees - mensualitesCredit;
    cashFlowCumule += cashFlow;
    
    const valeurBienEstimee = Math.round(prixBien * Math.pow(1 + evolutionPrixAnnuelle / 100, annee));
    const plusValueLatente = valeurBienEstimee - prixBien - capitalRembourseAnnee * annee;
    
    projection.push({
      annee,
      loyersPerçus,
      chargesPayees,
      mensualitesCredit,
      cashFlow,
      cashFlowCumule: Math.round(cashFlowCumule),
      capitalRestantDu: Math.round(capitalRestant),
      valeurBienEstimee,
      plusValueLatente: Math.round(plusValueLatente),
    });
  }
  
  return projection;
}
