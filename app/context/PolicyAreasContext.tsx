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
      .then((data) => {
        console.log(
          "Policy areas fetch success, count:",
          Object.keys(data).length,
        );
        setPolicyAreas(data);
      })
      .catch((err) => {
        console.log("Policy areas fetch FAILED:", err.message);
      });
  }, []);

  return (
    <PolicyAreasContext.Provider value={policyAreas}>
      {children}
    </PolicyAreasContext.Provider>
  );
};

export const usePolicyAreas = () => useContext(PolicyAreasContext);
