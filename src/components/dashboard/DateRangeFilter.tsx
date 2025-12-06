import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  onFilterChange: (fromDate: Date | undefined, toDate: Date | undefined) => void;
}

export function DateRangeFilter({ onFilterChange }: DateRangeFilterProps) {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();

  const handleFromDateChange = (date: Date | undefined) => {
    setFromDate(date);
    onFilterChange(date, toDate);
  };

  const handleToDateChange = (date: Date | undefined) => {
    setToDate(date);
    onFilterChange(fromDate, date);
  };

  const clearFilters = () => {
    setFromDate(undefined);
    setToDate(undefined);
    onFilterChange(undefined, undefined);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'justify-start text-left font-normal',
              !fromDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {fromDate ? format(fromDate, 'PPP') : 'From Date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={fromDate}
            onSelect={handleFromDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <span className="text-muted-foreground">to</span>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'justify-start text-left font-normal',
              !toDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {toDate ? format(toDate, 'PPP') : 'To Date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={toDate}
            onSelect={handleToDateChange}
            disabled={(date) => fromDate ? date < fromDate : false}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {(fromDate || toDate) && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
