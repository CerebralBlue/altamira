import { createContext, useContext, useState } from 'react';

interface compareResultsProps {
  show?: boolean;
  results?: Array<any>;
}

const CompareResultsContext = createContext<any>(undefined!);
export function CompareResultsProvider ({ children }: any) {
  const [results, setResults] = useState<compareResultsProps>({
    show: false,
    results: []
  });

  return (
    <CompareResultsContext.Provider value={{ results, setResults }}>
      {children}
    </CompareResultsContext.Provider>
  );
};

export const useCompareResultsContext = () => {
  const context = useContext(CompareResultsContext);

  if (typeof context === "undefined") {
    throw new Error(
      "useCompareResultsContext should be used within the CompareResultsContext provider!"
    );
  }

  return context;
};