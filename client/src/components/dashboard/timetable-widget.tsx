import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarPlus } from "lucide-react";
import { motion } from "framer-motion";

interface TimetableEntry {
  id: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  courseTitle?: string;
}

interface TimetableWidgetProps {
  timetable: TimetableEntry[];
}

export function TimetableWidget({ timetable }: TimetableWidgetProps) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();

  const getTimetableForDay = (dayIndex: number) => {
    return timetable.filter(entry => entry.dayOfWeek === dayIndex);
  };

  return (
    <GlassCard className="p-6 neon-glow mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          <GradientText>Weekly Timetable</GradientText>
        </h2>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/80 transition-colors duration-300">
          <CalendarPlus className="mr-2 h-4 w-4" />
          View Full Schedule
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => {
          const dayEntries = getTimetableForDay(index);
          const isToday = index === today;
          
          return (
            <motion.div
              key={day}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className={`text-sm font-medium mb-2 ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                {day}
              </div>
              <div className="space-y-1 min-h-[100px]">
                {dayEntries.length > 0 ? (
                  dayEntries.map((entry) => (
                    <GlassCard 
                      key={entry.id} 
                      className={`p-2 text-xs ${isToday ? 'neon-border' : ''}`}
                    >
                      <div className="font-medium text-primary">{entry.title}</div>
                      <div className="text-muted-foreground">{entry.startTime}</div>
                    </GlassCard>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground py-4">
                    {index === 0 || index === 6 ? 'No classes' : 'Free day'}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
