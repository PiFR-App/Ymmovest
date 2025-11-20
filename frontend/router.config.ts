// Configuration avancée du router React Router v7
// Ce fichier peut être utilisé pour personnaliser le comportement du router

export const routerConfig = {
  // Configuration du comportement du scroll
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
  
  // Options pour le router
  basename: "/", // Change this if your app is not at the root
  
  // Configuration du scroll restoration
  scrollRestoration: "auto" as const,
};

// Hook personnalisé pour le scroll to top lors du changement de route
export function useScrollToTop() {
  // Vous pouvez implémenter votre logique de scroll ici si nécessaire
  // Par exemple, scroll to top sur chaque changement de route
}

// Fonction utilitaire pour créer des liens avec state
export function createLinkWithState(to: string, state?: any) {
  return {
    pathname: to,
    state,
  };
}
