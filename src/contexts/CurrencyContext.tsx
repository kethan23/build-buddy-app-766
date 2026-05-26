import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type Currency = "USD" | "EUR" | "GBP" | "AED" | "INR";

// Static base = USD. Update via admin later. These are rounded reference rates.
const RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  AED: 3.67,
  INR: 83.5,
};

const SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
  INR: "₹",
};

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  symbol: string;
  convertFromUSD: (usd: number) => number;
  format: (usd: number, opts?: { decimals?: number }) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);
const STORAGE_KEY = "mc_currency";

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window === "undefined") return "USD";
    return (localStorage.getItem(STORAGE_KEY) as Currency) || "USD";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const value = useMemo<CurrencyContextValue>(() => {
    const rate = RATES[currency];
    return {
      currency,
      setCurrency: setCurrencyState,
      symbol: SYMBOLS[currency],
      convertFromUSD: (usd) => usd * rate,
      format: (usd, opts) => {
        const converted = usd * rate;
        const decimals = opts?.decimals ?? (converted >= 1000 ? 0 : 0);
        return `${SYMBOLS[currency]}${converted.toLocaleString(undefined, {
          maximumFractionDigits: decimals,
          minimumFractionDigits: 0,
        })}`;
      },
    };
  }, [currency]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
};

export const CURRENCIES: Currency[] = ["USD", "EUR", "GBP", "AED", "INR"];
