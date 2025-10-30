// Données mockées basées sur les prix réels approximatifs du marché français
// Source simulée : API DVF+ / Baromètre des prix au m²

export interface CommuneData {
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

export const communesData: CommuneData[] = [
  // Paris et arrondissements
  {
    code: "75056",
    nom: "Paris",
    codePostal: "75000",
    prixM2Median: 10500,
    prixM2Min: 8000,
    prixM2Max: 15000,
    evolution1An: 3.2,
    nombreTransactions: 12543,
    loyerM2Median: 28,
  },
  {
    code: "75101",
    nom: "Paris 1er",
    codePostal: "75001",
    prixM2Median: 12800,
    prixM2Min: 10000,
    prixM2Max: 18000,
    evolution1An: 2.8,
    nombreTransactions: 245,
    loyerM2Median: 32,
  },
  {
    code: "75108",
    nom: "Paris 8e",
    codePostal: "75008",
    prixM2Median: 13500,
    prixM2Min: 11000,
    prixM2Max: 20000,
    evolution1An: 2.5,
    nombreTransactions: 324,
    loyerM2Median: 34,
  },
  {
    code: "75111",
    nom: "Paris 11e",
    codePostal: "75011",
    prixM2Median: 10200,
    prixM2Min: 8500,
    prixM2Max: 13500,
    evolution1An: 4.1,
    nombreTransactions: 678,
    loyerM2Median: 27,
  },
  {
    code: "75118",
    nom: "Paris 18e",
    codePostal: "75018",
    prixM2Median: 8900,
    prixM2Min: 7000,
    prixM2Max: 12000,
    evolution1An: 5.2,
    nombreTransactions: 892,
    loyerM2Median: 24,
  },

  // Île-de-France
  {
    code: "92024",
    nom: "Boulogne-Billancourt",
    codePostal: "92100",
    prixM2Median: 8500,
    prixM2Min: 6500,
    prixM2Max: 11000,
    evolution1An: 3.8,
    nombreTransactions: 1234,
    loyerM2Median: 23,
  },
  {
    code: "92050",
    nom: "Neuilly-sur-Seine",
    codePostal: "92200",
    prixM2Median: 11200,
    prixM2Min: 9000,
    prixM2Max: 15000,
    evolution1An: 2.1,
    nombreTransactions: 456,
    loyerM2Median: 29,
  },
  {
    code: "94028",
    nom: "Créteil",
    codePostal: "94000",
    prixM2Median: 4200,
    prixM2Min: 3200,
    prixM2Max: 5500,
    evolution1An: 4.5,
    nombreTransactions: 789,
    loyerM2Median: 14,
  },
  {
    code: "93066",
    nom: "Saint-Denis",
    codePostal: "93200",
    prixM2Median: 3800,
    prixM2Min: 2800,
    prixM2Max: 5200,
    evolution1An: 6.2,
    nombreTransactions: 1123,
    loyerM2Median: 13,
  },
  {
    code: "78646",
    nom: "Versailles",
    codePostal: "78000",
    prixM2Median: 6500,
    prixM2Min: 5000,
    prixM2Max: 9000,
    evolution1An: 3.5,
    nombreTransactions: 567,
    loyerM2Median: 18,
  },

  // Grandes villes
  {
    code: "13055",
    nom: "Marseille",
    codePostal: "13000",
    prixM2Median: 3500,
    prixM2Min: 2200,
    prixM2Max: 5500,
    evolution1An: 5.8,
    nombreTransactions: 3456,
    loyerM2Median: 12,
  },
  {
    code: "69123",
    nom: "Lyon",
    codePostal: "69000",
    prixM2Median: 5200,
    prixM2Min: 3800,
    prixM2Max: 7500,
    evolution1An: 4.2,
    nombreTransactions: 2345,
    loyerM2Median: 15,
  },
  {
    code: "31555",
    nom: "Toulouse",
    codePostal: "31000",
    prixM2Median: 3800,
    prixM2Min: 2800,
    prixM2Max: 5200,
    evolution1An: 6.5,
    nombreTransactions: 2123,
    loyerM2Median: 13,
  },
  {
    code: "06088",
    nom: "Nice",
    codePostal: "06000",
    prixM2Median: 4900,
    prixM2Min: 3500,
    prixM2Max: 7500,
    evolution1An: 3.9,
    nombreTransactions: 1567,
    loyerM2Median: 16,
  },
  {
    code: "44109",
    nom: "Nantes",
    codePostal: "44000",
    prixM2Median: 4100,
    prixM2Min: 3000,
    prixM2Max: 5800,
    evolution1An: 5.2,
    nombreTransactions: 1789,
    loyerM2Median: 14,
  },
  {
    code: "33063",
    nom: "Bordeaux",
    codePostal: "33000",
    prixM2Median: 5000,
    prixM2Min: 3500,
    prixM2Max: 7000,
    evolution1An: 4.8,
    nombreTransactions: 1923,
    loyerM2Median: 15,
  },
  {
    code: "67482",
    nom: "Strasbourg",
    codePostal: "67000",
    prixM2Median: 3400,
    prixM2Min: 2500,
    prixM2Max: 4800,
    evolution1An: 4.1,
    nombreTransactions: 1234,
    loyerM2Median: 12,
  },
  {
    code: "59350",
    nom: "Lille",
    codePostal: "59000",
    prixM2Median: 3600,
    prixM2Min: 2600,
    prixM2Max: 5000,
    evolution1An: 5.5,
    nombreTransactions: 1678,
    loyerM2Median: 13,
  },
  {
    code: "35238",
    nom: "Rennes",
    codePostal: "35000",
    prixM2Median: 3900,
    prixM2Min: 2900,
    prixM2Max: 5400,
    evolution1An: 6.1,
    nombreTransactions: 1456,
    loyerM2Median: 13,
  },
  {
    code: "34172",
    nom: "Montpellier",
    codePostal: "34000",
    prixM2Median: 4200,
    prixM2Min: 3100,
    prixM2Max: 6000,
    evolution1An: 5.3,
    nombreTransactions: 1567,
    loyerM2Median: 14,
  },

  // Villes moyennes
  {
    code: "21231",
    nom: "Dijon",
    codePostal: "21000",
    prixM2Median: 2800,
    prixM2Min: 2000,
    prixM2Max: 4000,
    evolution1An: 4.2,
    nombreTransactions: 789,
    loyerM2Median: 11,
  },
  {
    code: "51108",
    nom: "Reims",
    codePostal: "51100",
    prixM2Median: 2400,
    prixM2Min: 1800,
    prixM2Max: 3500,
    evolution1An: 4.8,
    nombreTransactions: 567,
    loyerM2Median: 10,
  },
  {
    code: "76540",
    nom: "Rouen",
    codePostal: "76000",
    prixM2Median: 2600,
    prixM2Min: 1900,
    prixM2Max: 3800,
    evolution1An: 4.5,
    nombreTransactions: 678,
    loyerM2Median: 11,
  },
  {
    code: "37261",
    nom: "Tours",
    codePostal: "37000",
    prixM2Median: 2900,
    prixM2Min: 2100,
    prixM2Max: 4200,
    evolution1An: 5.1,
    nombreTransactions: 734,
    loyerM2Median: 11,
  },
  {
    code: "25056",
    nom: "Besançon",
    codePostal: "25000",
    prixM2Median: 2300,
    prixM2Min: 1700,
    prixM2Max: 3300,
    evolution1An: 3.9,
    nombreTransactions: 456,
    loyerM2Median: 10,
  },
];

// Fonction de recherche de commune
export function searchCommunes(query: string): CommuneData[] {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  return communesData
    .filter(commune => {
      const normalizedNom = commune.nom.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normalizedCP = commune.codePostal;
      return normalizedNom.includes(normalizedQuery) || normalizedCP.includes(query);
    })
    .slice(0, 8); // Limiter à 8 résultats
}

// Fonction pour obtenir une commune par son code
export function getCommuneByCode(code: string): CommuneData | undefined {
  return communesData.find(c => c.code === code);
}

// Fonction pour obtenir une commune par son nom
export function getCommuneByNom(nom: string): CommuneData | undefined {
  return communesData.find(c => c.nom.toLowerCase() === nom.toLowerCase());
}
