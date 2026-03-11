import React, { createContext, useContext, useEffect, useState } from "react";
import { billsService } from "../services/bills";

const PolicyAreasContext = createContext<Record<string, string>>({});

export const PolicyAreasProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [policyAreas, setPolicyAreas] = useState<Record<string, string>>({});

  useEffect(() => {
    billsService
      .getPolicyAreas()
      .then(setPolicyAreas)
      .catch(() => {}); // silent fail — policy areas are non-critical
  }, []);

  return (
    <PolicyAreasContext.Provider value={policyAreas}>
      {children}
    </PolicyAreasContext.Provider>
  );
};

export const usePolicyAreas = () => useContext(PolicyAreasContext);
