"use client";

import React, { useMemo, useState } from "react";
import { Save, Upload, User, Mail, Lock } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { uploadImageFile } from "@/lib/api/upload";

export const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setAvatar(user?.avatar || "");
  }, [user?.name, user?.email, user?.avatar]);

  const canSave = useMemo(() => {
    if (!name.trim() || !email.trim()) return false;
    if (password && password !== confirmPassword) return false;
    return true;
  }, [name, email, password, confirmPassword]);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "Please select an image file." });
      return;
    }
    setMessage(null);
    setPreview(URL.createObjectURL(file));
    setUploadProgress(1);
    try {
      const uploaded = await uploadImageFile(file, setUploadProgress);
      setAvatar(uploaded.url);
      setUploadProgress(100);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Upload failed" });
      setUploadProgress(0);
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    if (!canSave) return;

    setSaving(true);
    const payload: { name?: string; email?: string; password?: string; avatar?: string } = {
      name: name.trim(),
      email: email.trim(),
      avatar,
    };
    if (password.trim()) payload.password = password.trim();

    const result = await updateProfile(payload);
    setSaving(false);
    if (!result.ok) {
      setMessage({ type: "error", text: result.message || "Could not update profile" });
      return;
    }
    setPassword("");
    setConfirmPassword("");
    setMessage({ type: "success", text: "Profile updated successfully." });
  };

  const resetForm = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPassword("");
    setConfirmPassword("");
    setAvatar(user?.avatar || "");
    setPreview(null);
    setUploadProgress(0);
    setMessage(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 max-w-7xl mx-auto">
      <div>
        <h1 className="fluid-title font-bold text-foreground uppercase tracking-[0.16em]">Admin Profile</h1>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-[0.28em] mt-2">
          Manage your account details and security
        </p>
      </div>

      <form onSubmit={handleSave} className="premium-surface p-6 sm:p-8 md:p-10 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <div className="space-y-4">
            <div className="relative w-36 h-36 mx-auto lg:mx-0">
              <img
                src={
                  preview ||
                  avatar ||
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                }
                alt="Profile"
                className="w-full h-full rounded-xl border border-border object-cover"
              />
            </div>

            <label
              className="block border border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFile(e.dataTransfer.files?.[0]);
              }}
            >
              <Upload className="w-4 h-4 mx-auto mb-2 text-muted-foreground" />
              <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                Drag & drop or click to upload
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>

            {uploadProgress > 0 && uploadProgress < 100 ? (
              <div className="w-full h-2 bg-secondary rounded">
                <div className="h-2 bg-primary rounded" style={{ width: `${uploadProgress}%` }} />
              </div>
            ) : null}
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="premium-input pl-12"
                    placeholder="Admin name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="premium-input pl-12"
                    placeholder="info@luxorld.com"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="premium-input pl-12"
                    placeholder="Leave blank to keep current"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="premium-input pl-12"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>

            {message ? (
              <p
                className={`text-[10px] font-bold uppercase tracking-widest ${
                  message.type === "success" ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {message.text}
              </p>
            ) : null}

            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-border">
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-8 py-3 border border-border rounded-md text-[10px] font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSave || saving}
                className="w-full sm:w-auto px-10 py-3 bg-primary text-primary-foreground rounded-md font-bold uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;
