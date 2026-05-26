import { DollarSign } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency, CURRENCIES } from "@/contexts/CurrencyContext";

export const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();
  return (
    <Select value={currency} onValueChange={(v) => setCurrency(v as any)}>
      <SelectTrigger className="w-10 sm:w-[78px] h-8 sm:h-9 px-2 sm:px-3" aria-label="Currency">
        <DollarSign className="h-4 w-4 shrink-0" />
        <span className="hidden sm:inline ml-1"><SelectValue /></span>
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((c) => (
          <SelectItem key={c} value={c}>{c}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CurrencySelector;
