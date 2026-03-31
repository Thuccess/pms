"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  User,
  Shield,
  SlidersHorizontal,
  Database,
  Save,
  Upload,
  Eye,
  EyeOff,
  Download,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
  Bell,
  LayoutDashboard,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { apiRequest, API_BASE_URL, authTokenStorage } from "@/lib/api/client";
import { uploadImageFile } from "@/lib/api/upload";

type SettingsUser = {
  id: string;
  name?: string;
  email: string;
  avatar?: string;
};

type Density = "compact" | "comfortable";
type DashboardView = "overview" | "finance" | "operations";

const SETTINGS_KEYS = {
  density: "luxorld_ui_density",
  notifications: "luxorld_notifications_enabled",
  dashboardView: "luxorld_default_dashboard_view",
};

export const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { user, refreshMe, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState("Profile");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    avatar: "",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [savingProfile, setSavingProfile] = useState(false);

  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState(false);
  const [securityMsg, setSecurityMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  const [density, setDensity] = useState<Density>("comfortable");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [defaultDashboardView, setDefaultDashboardView] = useState<DashboardView>("overview");
  const [prefsMsg, setPrefsMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [exporting, setExporting] = useState(false);

  const tabs = [
    { id: "Profile", icon: User, label: "Profile" },
    { id: "Account", icon: Mail, label: "Account" },
    { id: "Security", icon: Shield, label: "Security" },
    { id: "Preferences", icon: SlidersHorizontal, label: "System Preferences" },
    { id: "Data", icon: Database, label: "Data & Export" },
  ];

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      avatar: user?.avatar || "",
    });
  }, [user?.name, user?.email, user?.avatar]);

  useEffect(() => {
    const savedDensity = window.localStorage.getItem(SETTINGS_KEYS.density) as Density | null;
    const savedNotifications = window.localStorage.getItem(SETTINGS_KEYS.notifications);
    const savedView = window.localStorage.getItem(SETTINGS_KEYS.dashboardView) as DashboardView | null;
    if (savedDensity) setDensity(savedDensity);
    if (savedNotifications) setNotificationsEnabled(savedNotifications === "true");
    if (savedView) setDefaultDashboardView(savedView);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("density-compact", density === "compact");
  }, [density]);

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const profile = await apiRequest<SettingsUser>("/profile");
      setProfileForm({
        name: profile.name || "",
        email: profile.email || "",
        avatar: profile.avatar || "",
      });
    } catch (error) {
      setProfileMsg({ type: "error", text: error instanceof Error ? error.message : "Could not load profile" });
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setProfileMsg(null);
    setPreview(URL.createObjectURL(file));
    setUploadProgress(1);
    try {
      const uploaded = await uploadImageFile(file, setUploadProgress);
      setProfileForm((prev) => ({ ...prev, avatar: uploaded.url }));
      setUploadProgress(100);
    } catch (error) {
      setUploadProgress(0);
      setProfileMsg({ type: "error", text: error instanceof Error ? error.message : "Image upload failed" });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    const result = await updateProfile({
      name: profileForm.name.trim(),
      email: profileForm.email.trim(),
      avatar: profileForm.avatar,
    });
    setSavingProfile(false);
    if (!result.ok) {
      setProfileMsg({ type: "error", text: result.message || "Profile update failed" });
      return;
    }
    await refreshMe();
    setProfileMsg({ type: "success", text: "Profile updated successfully." });
  };

  const passwordValid = useMemo(
    () => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(securityForm.newPassword),
    [securityForm.newPassword]
  );

  const passwordsMatch = securityForm.newPassword.length > 0 && securityForm.newPassword === securityForm.confirmPassword;

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSecurityMsg(null);
    if (!passwordValid) {
      setSecurityMsg({
        type: "error",
        text: "New password must be 8+ chars with uppercase, lowercase, and number.",
      });
      return;
    }
    if (!passwordsMatch) {
      setSecurityMsg({ type: "error", text: "Password confirmation does not match." });
      return;
    }
    setChangingPassword(true);
    const result = await changePassword({
      currentPassword: securityForm.currentPassword,
      newPassword: securityForm.newPassword,
    });
    setChangingPassword(false);
    if (!result.ok) {
      setSecurityMsg({ type: "error", text: result.message || "Password update failed." });
      return;
    }
    setSecurityForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setSecurityMsg({ type: "success", text: "Password updated successfully." });
  };

  const savePreferences = () => {
    window.localStorage.setItem(SETTINGS_KEYS.density, density);
    window.localStorage.setItem(SETTINGS_KEYS.notifications, String(notificationsEnabled));
    window.localStorage.setItem(SETTINGS_KEYS.dashboardView, defaultDashboardView);
    setPrefsMsg({ type: "success", text: "Preferences saved." });
  };

  const downloadCsv = async () => {
    setExporting(true);
    try {
      const token = authTokenStorage.get();
      const response = await fetch(`${API_BASE_URL}/export/csv?resource=properties`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error("CSV export failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "properties.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setPrefsMsg({ type: "error", text: error instanceof Error ? error.message : "Export failed" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 max-w-screen-xl mx-auto">
      <div>
        <h1 className="fluid-title font-bold text-foreground uppercase tracking-[0.16em]">System Settings</h1>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.28em] mt-2">
          Configure your elite property management environment.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
        <div className="lg:w-80 flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 gap-2 no-scrollbar border-b lg:border-b-0 border-border lg:border-r border-r-0 pr-0 lg:pr-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "shrink-0 flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-md transition-all group whitespace-nowrap",
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              <tab.icon className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", activeTab === tab.id ? "text-primary-foreground" : "text-primary")} />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
              {activeTab === tab.id ? <ChevronRight className="hidden lg:block w-4 h-4 ml-auto" /> : null}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-card border border-border rounded-lg card-shadow p-6 sm:p-8 md:p-10">
          <AnimatePresence mode="wait">
            {activeTab === "Profile" ? (
              <motion.form
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
                onSubmit={handleSaveProfile}
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <img
                    src={
                      preview ||
                      profileForm.avatar ||
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    }
                    className="w-24 h-24 rounded-full border border-border object-cover"
                    alt="profile"
                  />
                  <label className="border border-dashed border-border rounded-md p-4 text-center cursor-pointer hover:border-primary transition-colors w-full sm:w-auto">
                    <Upload className="w-4 h-4 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Upload profile picture</p>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
                  </label>
                </div>
                {uploadProgress > 0 && uploadProgress < 100 ? (
                  <div className="w-full h-2 bg-secondary rounded">
                    <div className="h-2 bg-primary rounded" style={{ width: `${uploadProgress}%` }} />
                  </div>
                ) : null}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="premium-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="premium-input"
                    />
                  </div>
                </div>
                {profileMsg ? (
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest", profileMsg.type === "success" ? "text-emerald-500" : "text-red-500")}>
                    {profileMsg.text}
                  </p>
                ) : null}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
                  <button
                    type="button"
                    className="px-8 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition-all"
                    onClick={() =>
                      setProfileForm({
                        name: user?.name || "",
                        email: user?.email || "",
                        avatar: user?.avatar || "",
                      })
                    }
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProfile || loadingProfile}
                    className="px-10 py-3 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-60"
                  >
                    {savingProfile ? "Saving..." : "Save Profile"}
                  </button>
                </div>
              </motion.form>
            ) : null}

            {activeTab === "Account" ? (
              <motion.div key="account" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="premium-surface p-6 space-y-4">
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.3em]">Account Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Admin Name</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">{user?.name || "Admin"}</p>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Account Email</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <div className="premium-surface p-6 space-y-4">
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.3em]">Session</h3>
                  <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                    Protected routes are enforced and session is stored securely with token-based authentication.
                  </p>
                </div>
              </motion.div>
            ) : null}

            {activeTab === "Security" ? (
              <motion.form
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
                onSubmit={handleChangePassword}
              >
                <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.3em]">Change Password</h3>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={securityForm.currentPassword}
                    onChange={(e) => setSecurityForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                    className="premium-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">New Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={securityForm.newPassword}
                    onChange={(e) => setSecurityForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                    className="premium-input"
                  />
                  {!passwordValid && securityForm.newPassword ? (
                    <p className="text-[9px] text-red-500 uppercase tracking-widest">Use 8+ chars, uppercase, lowercase, number.</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Confirm Password</label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={securityForm.confirmPassword}
                    onChange={(e) => setSecurityForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="premium-input"
                  />
                  {securityForm.confirmPassword && !passwordsMatch ? (
                    <p className="text-[9px] text-red-500 uppercase tracking-widest">Passwords do not match.</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary"
                  onClick={() => setShowPasswords((prev) => !prev)}
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPasswords ? "Hide Passwords" : "Show Passwords"}
                </button>
                {securityMsg ? (
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest", securityMsg.type === "success" ? "text-emerald-500" : "text-red-500")}>
                    {securityMsg.text}
                  </p>
                ) : null}
                <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="px-10 py-3 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-60"
                  >
                    {changingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </motion.form>
            ) : null}

            {activeTab === "Preferences" ? (
              <motion.div key="prefs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.3em]">Theme</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button onClick={() => setTheme("light")} className={cn("premium-surface p-4 flex items-center gap-3", theme === "light" ? "border-primary" : "")}>
                      <Sun className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-widest">Light</span>
                    </button>
                    <button onClick={() => setTheme("dark")} className={cn("premium-surface p-4 flex items-center gap-3", theme === "dark" ? "border-primary" : "")}>
                      <Moon className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-widest">Dark</span>
                    </button>
                    <button onClick={() => setTheme("system")} className={cn("premium-surface p-4 flex items-center gap-3", theme === "system" ? "border-primary" : "")}>
                      <Monitor className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-widest">System</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">UI Density</label>
                    <select
                      className="premium-input"
                      value={density}
                      onChange={(e) => setDensity(e.target.value as Density)}
                    >
                      <option value="comfortable">Comfortable</option>
                      <option value="compact">Compact</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Default Dashboard View</label>
                    <select
                      className="premium-input"
                      value={defaultDashboardView}
                      onChange={(e) => setDefaultDashboardView(e.target.value as DashboardView)}
                    >
                      <option value="overview">Overview</option>
                      <option value="finance">Finance</option>
                      <option value="operations">Operations</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  className={cn(
                    "premium-surface p-4 w-full flex items-center justify-between",
                    notificationsEnabled ? "border-primary/50" : ""
                  )}
                  onClick={() => setNotificationsEnabled((prev) => !prev)}
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Notifications</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
                    {notificationsEnabled ? "Enabled" : "Disabled"}
                  </span>
                </button>

                {prefsMsg ? <p className={cn("text-[10px] font-bold uppercase tracking-widest", prefsMsg.type === "success" ? "text-emerald-500" : "text-red-500")}>{prefsMsg.text}</p> : null}
                <div className="flex items-center justify-end pt-4 border-t border-border">
                  <button onClick={savePreferences} className="px-10 py-3 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all">
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            ) : null}

            {activeTab === "Data" ? (
              <motion.div key="data" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="premium-surface p-6 space-y-4">
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.3em]">Data Export Controls</h3>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
                    Export current system records to CSV for audits and backups.
                  </p>
                  <button
                    type="button"
                    onClick={downloadCsv}
                    disabled={exporting}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-3 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-60"
                  >
                    <Download className="w-4 h-4" />
                    {exporting ? "Preparing..." : "Download CSV"}
                  </button>
                </div>
                <div className="premium-surface p-6 space-y-4">
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-[0.3em]">System Snapshot</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-card border border-border rounded-md p-4">
                      <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Auth Status</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-foreground">Protected</p>
                    </div>
                    <div className="bg-card border border-border rounded-md p-4">
                      <p className="text-[8px] uppercase tracking-widest text-muted-foreground">Dashboard Preset</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        {defaultDashboardView}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;
