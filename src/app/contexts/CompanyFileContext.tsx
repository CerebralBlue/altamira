import { createContext, useContext, useState } from 'react';

const CompanyFileContext = createContext<any>(undefined!);
export function CompanyFileProvider ({ children }: any) {
  const [companyFile, setCompanyFile] = useState<any>();

  return (
    <CompanyFileContext.Provider value={{ companyFile, setCompanyFile }}>
      {children}
    </CompanyFileContext.Provider>
  );
};

export const useCompanyFileContext = () => {
  const context = useContext(CompanyFileContext);

  if (typeof context === "undefined") {
    throw new Error(
      "useCompanyFileContext should be used within the CompanyFileContext provider!"
    );
  }

  return context;
};