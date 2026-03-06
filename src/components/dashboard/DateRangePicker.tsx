import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
    className?: string;
    date: DateRange | undefined;
    setDate: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
    className,
    date,
    setDate,
}: DateRangePickerProps) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-black text-[10px] uppercase italic border-4 border-foreground rounded-none h-auto py-3 px-4 shadow-[4px_4px_0px_black] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "dd/MM/yy")} -{" "}
                                    {format(date.to, "dd/MM/yy")}
                                </>
                            ) : (
                                format(date.from, "dd/MM/yy")
                            )
                        ) : (
                            <span>Filtrar_por_Data</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0 border-4 border-foreground rounded-none shadow-[8px_8px_0px_black]"
                    align="start"
                >
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        className="bg-background font-black"
                        classNames={{
                            day_selected: "bg-primary text-primary-foreground font-black",
                            day_today: "bg-secondary text-secondary-foreground font-black",
                            day_range_middle: "bg-accent text-accent-foreground font-medium",
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
