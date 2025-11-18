"use client";

import { useEffect, useState } from "react";

const fadeAnim = "transition-all duration-300 ease-in-out";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewImg, setPreviewImg] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  // load user and theme
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      window.location.href = "/login";
    } else {
      const usr = JSON.parse(storedUser);
      setUser(usr);
      if (usr?.image) setPreviewImg(usr.image);
    }

    const theme = localStorage.getItem("theme");
    if (theme === "dark") setDarkMode(true);
  }, []);

  const handleSaveProfile = () => {
    if (!user) return;
    const updatedUser = { ...user, image: previewImg };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 flex items-center justify-center ${
        darkMode ? "bg-black text-white" : "bg-background text-foreground"
      }`}
    >
      <div
        className={`w-full max-w-lg bg-card p-8 rounded-2xl shadow-xl border border-border ${fadeAnim}`}
      >
        <h1 className="text-3xl font-semibold text-center mb-6">
          Account Settings
        </h1>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <img
              src={
                previewImg ||
                "https://i.pinimg.com/736x/8c/60/05/8c60056bba33c0ade6415c41dd09b7b9.jpg"
              }
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border border-border shadow-md"
            />

            {isEditing && (
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white px-2 py-1 rounded-full text-xs cursor-pointer">
                Edit
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () =>
                        setPreviewImg(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            )}
          </div>

          <h2 className="text-xl font-semibold mt-4">{user.name}</h2>
          <p className="text-sm opacity-70">{user.email}</p>
        </div>

        {/* Info cards */}
        <div className="space-y-4 mb-8">
          <div className={`p-4 rounded-xl border border-border ${fadeAnim}`}>
            <p className="text-sm opacity-70">Status</p>
            <p className="font-medium text-green-500">Logged In</p>
          </div>

          <div className={`p-4 rounded-xl border border-border ${fadeAnim}`}>
            <p className="text-sm opacity-70">Account Type</p>
            <p className="font-medium">Standard User</p>
          </div>

          <div className={`p-4 rounded-xl border border-border ${fadeAnim}`}>
            <p className="text-sm opacity-70">User ID</p>
            <p className="font-medium">{user.id || "Not Available"}</p>
          </div>

          <div className={`p-4 rounded-xl border border-border ${fadeAnim}`}>
            <p className="text-sm opacity-70">Member Since</p>
            <p className="font-medium">
              {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Edit profile */}
        {!isEditing ? (
          <button
            className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Name"
              className="px-4 py-2 border rounded bg-input text-black"
              value={user.name}
              onChange={(e) =>
                setUser({ ...user, name: e.target.value })
              }
            />

            <button
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              onClick={handleSaveProfile}
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Logout */}
        <button
          className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          onClick={() => {
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}

