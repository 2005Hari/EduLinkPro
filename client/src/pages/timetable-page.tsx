import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { useState } from "react";
import { 
  Calendar,
  Clock,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from "lucide-react";

export default function TimetablePage() {
  const [currentWeek, setCurrentWeek] = useState(() => startOfWeek(new Date()));
  const [addEventOpen, setAddEventOpen] = useState(false);

  const { data: timetable = [] } = useQuery({
    queryKey: ["/api/timetable"],
  });

  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const getTimetableForDay = (dayIndex: number) => {
    return timetable.filter((entry: any) => entry.dayOfWeek === dayIndex)
      .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  const getColorForCourse = (index: number) => {
    const colors = [
      "border-l-primary bg-primary/10",
      "border-l-secondary bg-secondary/10", 
      "border-l-accent bg-accent/10",
      "border-l-green-400 bg-green-400/10",
      "border-l-blue-400 bg-blue-400/10"
    ];
    return colors[index % colors.length];
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => 
      direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1)
    );
  };

  const handleAddEvent = () => {
    setAddEventOpen(true);
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              <GradientText>Weekly Timetable</GradientText>
            </h1>
            <p className="text-muted-foreground">
              View your class schedule and upcoming sessions
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigateWeek('prev')}
              data-testid="button-prev-week"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" data-testid="text-current-week">
              {format(currentWeek, "MMM d")} - {format(addDays(currentWeek, 6), "MMM d, yyyy")}
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigateWeek('next')}
              data-testid="button-next-week"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleAddEvent}
              data-testid="button-add-event"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Weekly View */}
        <GlassCard className="p-6 neon-glow">
          <div className="grid grid-cols-8 gap-4">
            {/* Time column */}
            <div className="space-y-4">
              <div className="h-12 flex items-center">
                <span className="text-sm font-medium text-muted-foreground">Time</span>
              </div>
              {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
                <div key={hour} className="h-20 flex items-start">
                  <span className="text-xs text-muted-foreground">
                    {hour}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => {
              const dayEntries = getTimetableForDay(dayIndex);
              const isToday = dayIndex === new Date().getDay();
              
              return (
                <motion.div
                  key={day}
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: dayIndex * 0.1 }}
                >
                  {/* Day header */}
                  <div className="h-12 flex flex-col items-center justify-center glass-morphism rounded-lg">
                    <span className={`text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                      {day}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(addDays(currentWeek, dayIndex), "MMM d")}
                    </span>
                  </div>

                  {/* Time slots */}
                  <div className="relative space-y-4">
                    {Array.from({ length: 12 }, (_, i) => (
                      <div key={i} className="h-20 border-b border-border/30 relative">
                        {/* Render classes for this time slot */}
                        {dayEntries
                          .filter(entry => {
                            const entryHour = parseInt(entry.startTime.split(':')[0]);
                            return entryHour === i + 8;
                          })
                          .map((entry, entryIndex) => (
                            <motion.div
                              key={entry.id}
                              className={`absolute inset-x-0 top-0 p-2 rounded-lg border-l-4 ${getColorForCourse(entryIndex)} hover:scale-105 transition-transform duration-300 cursor-pointer`}
                              whileHover={{ scale: 1.02 }}
                              data-testid={`timetable-entry-${entry.id}`}
                            >
                              <div className="space-y-1">
                                <h4 className="text-sm font-semibold truncate">
                                  {entry.title}
                                </h4>
                                <p className="text-xs text-muted-foreground truncate">
                                  {entry.courseTitle}
                                </p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTimeRange(entry.startTime, entry.endTime)}
                                </div>
                                {entry.location && (
                                  <div className="flex items-center text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {entry.location}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>

        {/* Today's Schedule */}
        <GlassCard className="p-6 neon-glow">
          <h2 className="text-xl font-semibold mb-6">
            <GradientText>Today's Schedule</GradientText>
          </h2>
          
          <div className="space-y-4">
            {getTimetableForDay(new Date().getDay()).length > 0 ? (
              getTimetableForDay(new Date().getDay()).map((entry: any, index: number) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 glass-morphism rounded-lg hover:neon-border transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{entry.title}</h3>
                    <p className="text-sm text-muted-foreground">{entry.courseTitle}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeRange(entry.startTime, entry.endTime)}
                      </div>
                      {entry.location && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {entry.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {entry.startTime}
                  </Badge>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No classes today</h3>
                <p className="text-muted-foreground">
                  Enjoy your free day! Check back tomorrow for your schedule.
                </p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Add Event Dialog */}
        <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
          <DialogContent className="glass-morphism border-neon" data-testid="modal-timetable-event">
            <DialogHeader>
              <DialogTitle>
                <GradientText>Add Timetable Event</GradientText>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This feature is coming soon! You can create timetable entries from the teacher dashboard.
              </p>
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setAddEventOpen(false)}
                  data-testid="button-close-event-dialog"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </MainLayout>
  );
}
