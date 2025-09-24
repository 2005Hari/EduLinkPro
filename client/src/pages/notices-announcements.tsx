import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { 
  Megaphone,
  Search,
  Filter,
  Bell,
  Info,
  AlertTriangle,
  Trophy,
  BookOpen,
  Calendar,
  User
} from "lucide-react";

export default function NoticesAnnouncements() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { data: announcements = [] } = useQuery({
    queryKey: ["/api/announcements"],
  });

  const getAnnouncementIcon = (title: string, isGlobal: boolean) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('assignment')) return Megaphone;
    if (lowerTitle.includes('achievement') || lowerTitle.includes('congratulations')) return Trophy;
    if (lowerTitle.includes('schedule') || lowerTitle.includes('class')) return Calendar;
    if (lowerTitle.includes('course')) return BookOpen;
    if (lowerTitle.includes('urgent') || lowerTitle.includes('important')) return AlertTriangle;
    if (isGlobal) return Bell;
    return Info;
  };

  const getAnnouncementColor = (title: string, isGlobal: boolean) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('assignment')) return { icon: "text-primary", bg: "bg-primary/20", border: "border-l-primary" };
    if (lowerTitle.includes('achievement')) return { icon: "text-green-400", bg: "bg-green-400/20", border: "border-l-green-400" };
    if (lowerTitle.includes('urgent')) return { icon: "text-destructive", bg: "bg-destructive/20", border: "border-l-destructive" };
    if (isGlobal) return { icon: "text-secondary", bg: "bg-secondary/20", border: "border-l-secondary" };
    return { icon: "text-accent", bg: "bg-accent/20", border: "border-l-accent" };
  };

  const filteredAnnouncements = announcements.filter((announcement: any) => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "global") return matchesSearch && announcement.isGlobal;
    if (selectedFilter === "course") return matchesSearch && !announcement.isGlobal && announcement.courseName;
    if (selectedFilter === "urgent") return matchesSearch && announcement.title.toLowerCase().includes('urgent');
    
    return matchesSearch;
  });

  const groupedAnnouncements = {
    today: filteredAnnouncements.filter((a: any) => {
      const today = new Date();
      const announcementDate = new Date(a.createdAt);
      return announcementDate.toDateString() === today.toDateString();
    }),
    thisWeek: filteredAnnouncements.filter((a: any) => {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const announcementDate = new Date(a.createdAt);
      return announcementDate > weekAgo && announcementDate.toDateString() !== today.toDateString();
    }),
    older: filteredAnnouncements.filter((a: any) => {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const announcementDate = new Date(a.createdAt);
      return announcementDate <= weekAgo;
    })
  };

  const renderAnnouncementCard = (announcement: any, index: number) => {
    const Icon = getAnnouncementIcon(announcement.title, announcement.isGlobal);
    const colors = getAnnouncementColor(announcement.title, announcement.isGlobal);
    
    return (
      <motion.div
        key={announcement.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className={`glass-morphism rounded-lg p-4 border-l-4 ${colors.border} hover:neon-border transition-all duration-300`}
        data-testid={`announcement-${announcement.id}`}
      >
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
            <Icon className={`w-6 h-6 ${colors.icon}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg leading-tight">{announcement.title}</h3>
              <div className="flex items-center space-x-2 ml-4">
                {announcement.isGlobal && (
                  <Badge variant="secondary" className="text-xs">
                    <Bell className="w-3 h-3 mr-1" />
                    Global
                  </Badge>
                )}
                {announcement.courseName && (
                  <Badge variant="outline" className="text-xs">
                    {announcement.courseName}
                  </Badge>
                )}
              </div>
            </div>
            
            <p className="text-muted-foreground mb-3 leading-relaxed">
              {announcement.content}
            </p>
            
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{announcement.authorName}</span>
              </div>
              <span>{formatDistanceToNow(new Date(announcement.createdAt))} ago</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
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
              <GradientText>Announcements</GradientText>
            </h1>
            <p className="text-muted-foreground">
              Stay updated with the latest news and important information
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-6 neon-glow">
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                data-testid="input-search-announcements"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-input border border-border rounded-md px-3 py-2 text-sm"
                data-testid="select-filter"
              >
                <option value="all">All</option>
                <option value="global">Global</option>
                <option value="course">Course Specific</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-3 glass-morphism rounded-lg">
              <p className="text-2xl font-bold text-primary">{announcements.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-3 glass-morphism rounded-lg">
              <p className="text-2xl font-bold text-secondary">{groupedAnnouncements.today.length}</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
            <div className="text-center p-3 glass-morphism rounded-lg">
              <p className="text-2xl font-bold text-accent">{announcements.filter((a: any) => a.isGlobal).length}</p>
              <p className="text-xs text-muted-foreground">Global</p>
            </div>
            <div className="text-center p-3 glass-morphism rounded-lg">
              <p className="text-2xl font-bold text-green-400">{announcements.filter((a: any) => !a.isGlobal).length}</p>
              <p className="text-xs text-muted-foreground">Course Specific</p>
            </div>
          </div>
        </GlassCard>

        {/* Announcements List */}
        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            <TabsTrigger value="category">By Category</TabsTrigger>
          </TabsList>
          
          <TabsContent value="timeline" className="space-y-6">
            {/* Today */}
            {groupedAnnouncements.today.length > 0 && (
              <GlassCard className="p-6 neon-glow">
                <h2 className="text-xl font-semibold mb-4">
                  <GradientText>Today</GradientText>
                </h2>
                <div className="space-y-4">
                  {groupedAnnouncements.today.map((announcement, index) => 
                    renderAnnouncementCard(announcement, index)
                  )}
                </div>
              </GlassCard>
            )}

            {/* This Week */}
            {groupedAnnouncements.thisWeek.length > 0 && (
              <GlassCard className="p-6 neon-glow">
                <h2 className="text-xl font-semibold mb-4">
                  <GradientText>This Week</GradientText>
                </h2>
                <div className="space-y-4">
                  {groupedAnnouncements.thisWeek.map((announcement, index) => 
                    renderAnnouncementCard(announcement, index)
                  )}
                </div>
              </GlassCard>
            )}

            {/* Older */}
            {groupedAnnouncements.older.length > 0 && (
              <GlassCard className="p-6 neon-glow">
                <h2 className="text-xl font-semibold mb-4">
                  <GradientText>Earlier</GradientText>
                </h2>
                <div className="space-y-4">
                  {groupedAnnouncements.older.map((announcement, index) => 
                    renderAnnouncementCard(announcement, index)
                  )}
                </div>
              </GlassCard>
            )}

            {filteredAnnouncements.length === 0 && (
              <GlassCard className="p-12 neon-glow">
                <div className="text-center">
                  <Megaphone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No announcements found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try adjusting your search terms." : "Check back later for new announcements."}
                  </p>
                </div>
              </GlassCard>
            )}
          </TabsContent>
          
          <TabsContent value="category" className="space-y-6">
            {/* Global Announcements */}
            <GlassCard className="p-6 neon-glow">
              <h2 className="text-xl font-semibold mb-4">
                <GradientText className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Global Announcements
                </GradientText>
              </h2>
              <div className="space-y-4">
                {filteredAnnouncements.filter((a: any) => a.isGlobal).length > 0 ? (
                  filteredAnnouncements
                    .filter((a: any) => a.isGlobal)
                    .map((announcement, index) => renderAnnouncementCard(announcement, index))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No global announcements</p>
                )}
              </div>
            </GlassCard>

            {/* Course Specific */}
            <GlassCard className="p-6 neon-glow">
              <h2 className="text-xl font-semibold mb-4">
                <GradientText className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Specific
                </GradientText>
              </h2>
              <div className="space-y-4">
                {filteredAnnouncements.filter((a: any) => !a.isGlobal).length > 0 ? (
                  filteredAnnouncements
                    .filter((a: any) => !a.isGlobal)
                    .map((announcement, index) => renderAnnouncementCard(announcement, index))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No course-specific announcements</p>
                )}
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
}
