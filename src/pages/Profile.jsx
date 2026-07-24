import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import Layout from "../components/Layout";

const PREFERENCES_KEY = "libris_preferences";

const DEFAULT_PREFERENCES = {
  language: "English (US)",
  emailDigest: true,
  pushNotifications: false,
  twoFactorEnabled: false,
};

function loadPreferences() {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    return raw
      ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) }
      : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [preferences, setPreferences] = useState(loadPreferences);
  const [savedMessage, setSavedMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const fileInputRef = useRef(null);

  // Sync form fields with auth user
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setRole(user.role || "");
      setAvatarUrl(user.avatar_url || "");
    }
  }, [user]);

  useEffect(() => {
    if (!savedMessage) return;
    const timeout = setTimeout(() => setSavedMessage(""), 2500);
    return () => clearTimeout(timeout);
  }, [savedMessage]);

  useEffect(() => {
    if (!passwordMessage) return;
    const timeout = setTimeout(() => setPasswordMessage(null), 3000);
    return () => clearTimeout(timeout);
  }, [passwordMessage]);

  function persistPreferences(next) {
    setPreferences(next);
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!name || !email) return;
    setSaving(true);
    try {
      const updated = await api.auth.updateProfile({
        name,
        email,
        role,
        avatar_url: avatarUrl,
      });
      updateUser(updated);
      setSavedMessage("Profile updated.");
    } catch (err) {
      setSavedMessage(err.message || "Error saving profile");
    } finally {
      setSaving(false);
    }
  }

  function handleAvatarPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      setAvatarUrl(dataUrl);
      try {
        const updated = await api.auth.updateProfile({ avatar_url: dataUrl });
        updateUser(updated);
      } catch {
        // revert on error
      }
    };
    reader.readAsDataURL(file);
  }

  function handlePasswordSubmit(e) {
    e.preventDefault();
    if (!passwordForm.current || !passwordForm.next) {
      setPasswordMessage({
        type: "error",
        text: "Please fill in all password fields.",
      });
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordMessage({ type: "error", text: "New passwords don't match." });
      return;
    }
    setPasswordForm({ current: "", next: "", confirm: "" });
    setPasswordMessage({ type: "success", text: "Password updated." });
  }

  function toggle2FA() {
    persistPreferences({
      ...preferences,
      twoFactorEnabled: !preferences.twoFactorEnabled,
    });
  }

  return (
    <Layout active="profile">
      <main className="flex-grow ml-[280px] min-h-screen">
        <header className="fixed top-0 right-0 left-[280px] h-16 bg-surface-container-lowest border-b border-surface-variant flex justify-between items-center px-lg z-40">
          <div className="flex items-center gap-md">
            <h2 className="font-headline-md text-headline-md font-bold text-primary">
              Profile Settings
            </h2>
          </div>
        </header>

        <div className="mt-16 p-lg max-w-[1280px] mx-auto">
          <div className="mb-xl flex items-center justify-between">
            <div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
                Manage your identity
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Update your personal information and account preferences.
              </p>
            </div>
            {savedMessage && (
              <span className="font-label-md text-label-md text-secondary bg-secondary-container px-md py-sm rounded-full">
                {savedMessage}
              </span>
            )}
          </div>

          <div className="grid grid-cols-12 gap-lg">
            <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-surface-variant rounded-xl p-xl flex flex-col items-center text-center">
              <div className="relative group mb-lg">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-secondary-container bg-surface-container-high flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      className="w-full h-full object-cover"
                      src={avatarUrl}
                      alt={name}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[56px] text-on-surface-variant">
                      person
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-primary text-white p-sm rounded-full shadow-lg hover:scale-105 transition-transform"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    edit
                  </span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarPick}
                />
              </div>
              <h4 className="font-headline-md text-headline-md text-on-surface">
                {name}
              </h4>
              <p className="font-label-md text-label-md text-primary mb-xl">
                {role}
              </p>
              <div className="w-full space-y-md text-left pt-lg border-t border-surface-variant">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Storage used
                  </span>
                  <span className="font-label-sm text-label-sm font-bold text-on-surface">
                    78%
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[78%]"></div>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  15.6 GB of 20 GB used
                </p>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-surface-variant rounded-xl p-xl">
              <div className="flex items-center gap-md mb-xl">
                <span className="material-symbols-outlined text-primary">
                  badge
                </span>
                <h4 className="font-headline-md text-headline-md">
                  Personal Information
                </h4>
              </div>
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-lg"
                onSubmit={handleSave}
              >
                <div className="flex flex-col gap-xs md:col-span-2">
                  <label
                    className="font-label-sm text-label-sm text-on-surface-variant px-1"
                    htmlFor="name"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    className="bg-surface-container-lowest border border-surface-variant rounded-lg px-md py-md font-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-xs md:col-span-2">
                  <label
                    className="font-label-sm text-label-sm text-on-surface-variant px-1"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    className="bg-surface-container-lowest border border-surface-variant rounded-lg px-md py-md font-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label
                    className="font-label-sm text-label-sm text-on-surface-variant px-1"
                    htmlFor="role"
                  >
                    Current Role
                  </label>
                  <select
                    id="role"
                    className="bg-surface-container-lowest border border-surface-variant rounded-lg px-md py-md font-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option>Senior Researcher</option>
                    <option>Librarian</option>
                    <option>Content Architect</option>
                    <option>Curator</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end pt-md border-t border-surface-variant">
                  <button
                    className="bg-primary text-white font-label-md text-label-md px-xl py-md rounded-lg hover:bg-primary-container transition-colors active:scale-95 disabled:opacity-60"
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>

            <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-surface-variant rounded-xl p-xl">
              <div className="flex items-center gap-md mb-xl">
                <span className="material-symbols-outlined text-primary">
                  lock_reset
                </span>
                <h4 className="font-headline-md text-headline-md">
                  Password Modification
                </h4>
              </div>
              <form className="space-y-lg" onSubmit={handlePasswordSubmit}>
                {passwordMessage && (
                  <p
                    className={
                      "font-body-sm px-md py-sm rounded-lg " +
                      (passwordMessage.type === "error"
                        ? "text-error bg-error-container/30"
                        : "text-secondary bg-secondary-container")
                    }
                  >
                    {passwordMessage.text}
                  </p>
                )}
                <div className="flex flex-col gap-xs">
                  <label
                    className="font-label-sm text-label-sm text-on-surface-variant px-1"
                    htmlFor="currentPassword"
                  >
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      className="w-full bg-surface-container-lowest border border-surface-variant rounded-lg px-md py-md font-body-md focus:ring-2 focus:ring-primary outline-none"
                      placeholder="••••••••"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.current}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          current: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer"
                      onClick={() => setShowCurrentPassword((v) => !v)}
                    >
                      {showCurrentPassword ? "visibility_off" : "visibility"}
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-xs">
                  <label
                    className="font-label-sm text-label-sm text-on-surface-variant px-1"
                    htmlFor="newPassword"
                  >
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    className="bg-surface-container-lowest border border-surface-variant rounded-lg px-md py-md font-body-md focus:ring-2 focus:ring-primary outline-none"
                    type="password"
                    value={passwordForm.next}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        next: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-xs">
                  <label
                    className="font-label-sm text-label-sm text-on-surface-variant px-1"
                    htmlFor="confirmPassword"
                  >
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPassword"
                    className="bg-surface-container-lowest border border-surface-variant rounded-lg px-md py-md font-body-md focus:ring-2 focus:ring-primary outline-none"
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirm: e.target.value,
                      }))
                    }
                  />
                </div>
                <button
                  className="w-full py-md bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md rounded-lg hover:bg-secondary-fixed-dim transition-colors"
                  type="submit"
                >
                  Update Password
                </button>
              </form>
            </div>

            <div className="col-span-12 lg:col-span-6 bg-surface-container-lowest border border-surface-variant rounded-xl p-xl">
              <div className="flex items-center gap-md mb-xl">
                <span className="material-symbols-outlined text-primary">
                  tune
                </span>
                <h4 className="font-headline-md text-headline-md">
                  System Preferences
                </h4>
              </div>
              <div className="space-y-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">
                      System Language
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Default language for UI and alerts
                    </p>
                  </div>
                  <select
                    className="bg-surface-container-low border-none rounded-lg px-md py-sm font-label-sm text-label-sm text-primary font-bold"
                    value={preferences.language}
                    onChange={(e) =>
                      persistPreferences({
                        ...preferences,
                        language: e.target.value,
                      })
                    }
                  >
                    <option>English (US)</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Spanish</option>
                  </select>
                </div>

                <div className="space-y-md">
                  <p className="font-label-md text-label-md text-on-surface">
                    Notification Channels
                  </p>
                  <label className="flex items-center justify-between cursor-pointer p-md bg-surface-container-low rounded-lg hover:bg-surface-container hover:shadow-sm transition-all">
                    <div className="flex items-center gap-md">
                      <span className="material-symbols-outlined text-on-secondary-fixed-variant">
                        mail
                      </span>
                      <span className="font-body-sm text-body-sm">
                        Email digest (Daily)
                      </span>
                    </div>
                    <div className="relative inline-flex items-center">
                      <input
                        checked={preferences.emailDigest}
                        onChange={(e) =>
                          persistPreferences({
                            ...preferences,
                            emailDigest: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                        type="checkbox"
                      />
                      <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer p-md bg-surface-container-low rounded-lg hover:bg-surface-container hover:shadow-sm transition-all">
                    <div className="flex items-center gap-md">
                      <span className="material-symbols-outlined text-on-secondary-fixed-variant">
                        notifications_active
                      </span>
                      <span className="font-body-sm text-body-sm">
                        Push notifications
                      </span>
                    </div>
                    <div className="relative inline-flex items-center">
                      <input
                        checked={preferences.pushNotifications}
                        onChange={(e) =>
                          persistPreferences({
                            ...preferences,
                            pushNotifications: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                        type="checkbox"
                      />
                      <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                  </label>
                </div>
                <div className="pt-md border-t border-surface-variant">
                  <p className="font-label-sm text-label-sm text-on-surface-variant italic">
                    Preferences are saved on this device.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-12 bg-surface-container-low border border-surface-variant rounded-xl p-lg flex flex-col md:flex-row justify-between items-center gap-lg">
              <div className="flex items-center gap-md">
                <div className="bg-on-tertiary-fixed-variant/10 p-md rounded-full">
                  <span className="material-symbols-outlined text-on-tertiary-fixed-variant">
                    security
                  </span>
                </div>
                <div>
                  <h5 className="font-label-md text-label-md text-on-surface">
                    Security Check
                  </h5>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Two-factor authentication is currently{" "}
                    <span
                      className={
                        preferences.twoFactorEnabled
                          ? "text-secondary font-bold"
                          : "text-error font-bold"
                      }
                    >
                      {preferences.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </span>
                    .
                  </p>
                </div>
              </div>
              <button
                className="px-lg py-md border-2 border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary/5 transition-colors"
                onClick={toggle2FA}
              >
                {preferences.twoFactorEnabled
                  ? "Disable 2FA"
                  : "Enable 2FA Now"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
