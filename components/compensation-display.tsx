"use client";

import { useEffect, useState } from "react";
import {
  convertUsd,
  formatCurrency,
  SUPPORTED_CURRENCIES,
  type FxRates,
} from "@/lib/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COOKIE_NAME = "preferred_currency";

export function CompensationDisplay({
  amountUsd,
  rates,
  initialCurrency,
}: {
  amountUsd: number;
  rates: FxRates;
  initialCurrency: string;
}) {
  const [currency, setCurrency] = useState(initialCurrency);

  useEffect(() => {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`)
    );
    if (match) setCurrency(decodeURIComponent(match[1]));
  }, []);

  function handleChange(value: string | null) {
    if (!value) return;
    setCurrency(value);
    document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=31536000`;
  }

  const converted = convertUsd(amountUsd, currency, rates);

  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="font-heading text-4xl font-medium text-primary">
        {formatCurrency(converted, currency)}
      </span>
      {currency !== "USD" && (
        <span className="text-sm text-muted-foreground">
          (~{formatCurrency(amountUsd, "USD")})
        </span>
      )}
      <Select value={currency} onValueChange={handleChange}>
        <SelectTrigger className="h-7 w-auto gap-1 border-none text-xs text-muted-foreground shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_CURRENCIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
