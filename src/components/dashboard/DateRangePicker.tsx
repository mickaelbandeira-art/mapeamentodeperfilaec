import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
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
                            "w-full justify-start text-left font-black text-[10px] uppercase italic border-0 bg-transparent rounded-none h-auto p-0 hover:bg-transparent transition-all group",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <span className="truncate">
                            {date?.from ? (
                                date.to ? (
                                    <>
                                        {format(date.from, "dd/MM")} - {format(date.to, "dd/MM")}
                                    </>
                                ) : (
                                    format(date.from, "dd/MM/yy")
                                )
                            ) : (
                                "SET_RANGE"
                            )}
                        </span>
                        {date?.from && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent
                    className="w-auto p-0 border-4 border-foreground rounded-none shadow-[12px_12px_0px_var(--foreground)] bg-background z-50"
                    align="start"
                >
                    <div className="bg-foreground text-background p-2 text-[8px] font-black uppercase tracking-widest flex justify-between items-center">
                        <span>Calendar_Sync // Active</span>
                        <Loader2 className="w-3 h-3 animate-spin" />
                    </div>
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                        className="p-4"
                        classNames={{
                            day_selected: "bg-primary text-primary-foreground font-black hover:bg-primary/80",
                            day_today: "bg-secondary text-secondary-foreground font-black",
                            day_range_middle: "bg-accent/20 text-foreground font-medium",
                            head_cell: "text-[10px] font-black uppercase opacity-30",
                            button: "hover:bg-primary/10 transition-colors uppercase font-black text-[10px]",
                            nav_button: "hover:bg-primary/10 border-2 border-foreground rounded-none",
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
