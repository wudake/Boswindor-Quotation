"use client";

import { useEffect, useState } from "react";

export interface ConfigurationOption {
  id: string;
  category: string;
  value: string;
  label: string;
  labelEn: string | null;
  isActive: boolean;
  sortOrder: number;
}

export function useConfigurationOptions(category?: string) {
  const [options, setOptions] = useState<ConfigurationOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOptions() {
      setLoading(true);
      try {
        const url = category
          ? `/api/configurations?category=${encodeURIComponent(category)}`
          : "/api/configurations";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setOptions(data.filter((o: ConfigurationOption) => o.isActive));
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchOptions();
  }, [category]);

  return { options, loading };
}
