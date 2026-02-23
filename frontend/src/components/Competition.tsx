import { createContext, useContext, useState } from 'react';

interface CompetitionContextType {
  competition: number;
  setCompetition: (value: number) => void;
}

const CompetitionContext = createContext<CompetitionContextType | null>(null);

export function CompetitionProvider({ children }: { children: React.ReactNode }) {
  const [competition, setCompetition] = useState<number>(1);

  return (
    <CompetitionContext.Provider value={{ competition, setCompetition }}>
      {children}
    </CompetitionContext.Provider>
  );
}

export function useCompetition(): CompetitionContextType {
  const context = useContext(CompetitionContext);
  if (!context) throw new Error('useCompetition must be used within a CompetitionProvider');
  return context;
}