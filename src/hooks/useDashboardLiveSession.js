import { useContext } from "react";
import { DashboardLiveSessionContext } from "../context/DashboardLiveSessionContext.jsx";

export function useDashboardLiveSession() {
  const ctx = useContext(DashboardLiveSessionContext);
  if (!ctx) {
    throw new Error(
      "useDashboardLiveSession debe usarse dentro de DashboardLiveSessionProvider",
    );
  }
  return ctx;
}
