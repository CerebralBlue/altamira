import { createContext, useContext, useState } from 'react';

interface codeProps {
  show?: boolean;
  title?: number;
  part?: number;
  version?: string;
  fullPath?: string;
}

const CodeContext = createContext<any>(undefined!);
export function CodeProvider ({ children }: any) {
  const [code, setCode] = useState<codeProps>({
    show: false,
    fullPath: ''
  });

  return (
    <CodeContext.Provider value={{ code, setCode }}>
      {children}
    </CodeContext.Provider>
  );
};

export const useCodeContext = () => {
  const context = useContext(CodeContext);

  if (typeof context === "undefined") {
    throw new Error(
      "useCodeContext should be used within the CodeContext provider!"
    );
  }

  return context;
};