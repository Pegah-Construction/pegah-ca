"use client";

import { useState, useEffect } from "react";
import { SETTINGS_DEFAULTS } from "./settings";

// Client hook: returns the editable org/contact settings (defaults until loaded).
export function useSiteSettings() {
  const [s, setS] = useState<Record<string, string>>(SETTINGS_DEFAULTS);
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setS({ ...SETTINGS_DEFAULTS, ...d }))
      .catch(() => {});
  }, []);
  return s;
}
