import React, { useCallback, useContext, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { MediationManager } from '../../src/modules/mediation-manager.module';

type Logger = (...data: any[]) => void;

const CasContext = React.createContext<{
  manager: MediationManager | null;
  setManager: (manager: MediationManager) => void;
  logCasInfo: Logger;
  setCasLogger: (logger: Logger) => void;
}>({
  manager: null,
  setManager: () => ({}),
  logCasInfo: () => ({}),
  setCasLogger: () => ({}),
});

export const useCasContext = () => useContext(CasContext);

export const CasProvider = (props: PropsWithChildren<any>) => {
  const [manager, setManager] = useState<MediationManager | null>(null);
  const logger = useRef<Logger>();

  const logCasInfo = useCallback((...data: any[]) => {
    logger.current?.('CAS: ', ...data);
  }, []);

  return (
    <CasContext.Provider
      value={{
        manager,
        setManager,
        logCasInfo,
        setCasLogger: (l) => (logger.current = l),
      }}
    >
      {props.children}
    </CasContext.Provider>
  );
};
