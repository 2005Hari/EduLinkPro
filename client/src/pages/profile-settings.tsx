import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/context/theme-context";
import { MainLayout } from "@/components/layout/main-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { 
  User,
  Settings,
  Bell,
  Shield,
  Palette,
  Camera,
  Save,
  Moon,
  Sun,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  LogOut
} from "lucide-react";

export default function ProfileSettings() {
  const { user, logoutMutation } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    location: "",
    bio: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    assignmentReminders: true,
    gradeUpdates: true,
    announcements: true,
    weeklyReports: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: true,
    showOnlineStatus: true,
    allowDirectMessages: true,
    shareProgressData: false,
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSavePrivacy = () => {
    toast({
      title: "Privacy Settings Updated",
      description: "Your privacy preferences have been saved.",
    });
  };

  if (!user) return null;

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
              <GradientText>Profile & Settings</GradientText>
            </h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <GlassCard className="p-6 neon-glow">
              <div className="flex items-center space-x-4 mb-6">
                <User className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">
                  <GradientText>Profile Information</GradientText>
                </h2>
              </div>

              {/* Profile Picture */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.profilePicture || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {user.firstName[0]}{user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                    data-testid="button-change-avatar"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
                  <p className="text-muted-foreground capitalize">{user.role}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                    data-testid="input-last-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    data-testid="input-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    data-testid="input-phone"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, Country"
                    data-testid="input-location"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    data-testid="textarea-bio"
                  />
                </div>
              </div>

              <Button onClick={handleSaveProfile} data-testid="button-save-profile">
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </Button>
            </GlassCard>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <GlassCard className="p-6 neon-glow">
              <div className="flex items-center space-x-4 mb-6">
                <Bell className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">
                  <GradientText>Notification Preferences</GradientText>
                </h2>
              </div>

              <div className="space-y-6">
                {/* General Notifications */}
                <div>
                  <h3 className="font-semibold mb-4">General Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={notifications.emailNotifications}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
                        data-testid="switch-email-notifications"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
                      </div>
                      <Switch
                        checked={notifications.pushNotifications}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
                        data-testid="switch-push-notifications"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Academic Notifications */}
                <div>
                  <h3 className="font-semibold mb-4">Academic Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Assignment Reminders</p>
                        <p className="text-sm text-muted-foreground">Get reminded about upcoming deadlines</p>
                      </div>
                      <Switch
                        checked={notifications.assignmentReminders}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, assignmentReminders: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Grade Updates</p>
                        <p className="text-sm text-muted-foreground">Be notified when grades are posted</p>
                      </div>
                      <Switch
                        checked={notifications.gradeUpdates}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, gradeUpdates: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Announcements</p>
                        <p className="text-sm text-muted-foreground">Get notified about new announcements</p>
                      </div>
                      <Switch
                        checked={notifications.announcements}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, announcements: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Weekly Reports</p>
                        <p className="text-sm text-muted-foreground">Receive weekly progress summaries</p>
                      </div>
                      <Switch
                        checked={notifications.weeklyReports}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveNotifications} className="mt-6">
                <Save className="mr-2 h-4 w-4" />
                Save Notification Settings
              </Button>
            </GlassCard>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <GlassCard className="p-6 neon-glow">
              <div className="flex items-center space-x-4 mb-6">
                <Shield className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">
                  <GradientText>Privacy & Security</GradientText>
                </h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Profile Visibility</p>
                      <p className="text-sm text-muted-foreground">Allow others to see your profile information</p>
                    </div>
                    <Switch
                      checked={privacy.profileVisibility}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profileVisibility: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Online Status</p>
                      <p className="text-sm text-muted-foreground">Let others see when you're online</p>
                    </div>
                    <Switch
                      checked={privacy.showOnlineStatus}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showOnlineStatus: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Allow Direct Messages</p>
                      <p className="text-sm text-muted-foreground">Allow other users to send you messages</p>
                    </div>
                    <Switch
                      checked={privacy.allowDirectMessages}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, allowDirectMessages: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Share Progress Data</p>
                      <p className="text-sm text-muted-foreground">Allow anonymized data to be used for research</p>
                    </div>
                    <Switch
                      checked={privacy.shareProgressData}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, shareProgressData: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSavePrivacy} className="mt-6">
                <Save className="mr-2 h-4 w-4" />
                Save Privacy Settings
              </Button>
            </GlassCard>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <GlassCard className="p-6 neon-glow">
              <div className="flex items-center space-x-4 mb-6">
                <Palette className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">
                  <GradientText>Appearance & Theme</GradientText>
                </h2>
              </div>

              <div className="space-y-6">
                {/* Theme Selection */}
                <div>
                  <h3 className="font-semibold mb-4">Theme</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setTheme("light")}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        theme === "light" 
                          ? "border-primary bg-primary/10" 
                          : "border-border glass-morphism hover:border-primary/50"
                      }`}
                      data-testid="button-light-theme"
                    >
                      <div className="flex items-center space-x-3">
                        <Sun className="h-6 w-6" />
                        <div className="text-left">
                          <p className="font-medium">Light Mode</p>
                          <p className="text-sm text-muted-foreground">Clean and bright interface</p>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setTheme("dark")}
                      className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                        theme === "dark" 
                          ? "border-primary bg-primary/10" 
                          : "border-border glass-morphism hover:border-primary/50"
                      }`}
                      data-testid="button-dark-theme"
                    >
                      <div className="flex items-center space-x-3">
                        <Moon className="h-6 w-6" />
                        <div className="text-left">
                          <p className="font-medium">Dark Mode</p>
                          <p className="text-sm text-muted-foreground">Futuristic and easy on the eyes</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                <Separator />

                {/* Animation Settings */}
                <div>
                  <h3 className="font-semibold mb-4">Animation & Effects</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Reduced Motion</p>
                        <p className="text-sm text-muted-foreground">Minimize animations for better performance</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Glassmorphism Effects</p>
                        <p className="text-sm text-muted-foreground">Enable glass-like transparency effects</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Neon Glow Effects</p>
                        <p className="text-sm text-muted-foreground">Enable futuristic neon lighting</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Account Actions */}
            <GlassCard className="p-6 neon-glow">
              <div className="flex items-center space-x-4 mb-6">
                <Settings className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">
                  <GradientText>Account Actions</GradientText>
                </h2>
              </div>

              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => logoutMutation.mutate()}
                  data-testid="button-logout-settings"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
}
