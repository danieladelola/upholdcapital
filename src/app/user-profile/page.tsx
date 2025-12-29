"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserProfile, updateUserProfileImage } from "@/actions/user";
import { useAuth } from "@/components/AuthProvider";

export default function UserProfilePage() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setFormData({
        firstName: authUser.firstname || "",
        lastName: authUser.lastname || "",
        email: authUser.email || "",
        phone: authUser.phoneNumber || "",
        address: authUser.country || "",
      });
      setImagePreview(authUser.photoURL || null);
    }
  }, [authUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile || !user) return;
    const formDataUpload = new FormData();
    formDataUpload.append("file", imageFile);
    formDataUpload.append("userId", user.id);

    try {
      const res = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: formDataUpload,
      });
      const data = await res.json();
      if (res.ok) {
        setUser({ ...user, profileImage: data.url });
        setSuccess("Profile image updated!");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Upload failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await updateUserProfile(user.id, formData);

    if (result.success) {
      setSuccess("Profile updated successfully!");
      setUser({ ...user, ...result.user });
    } else {
      setError("Failed to update profile");
    }

    setLoading(false);
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-semibold mb-4">Profile Picture</h2>
          <div className="flex flex-col items-center">
            <img
              src={imagePreview || "/default-avatar.png"}
              alt="Profile"
              className="w-40 h-40 rounded-full mb-4 object-cover"
            />
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mb-2"
            />
            <Button onClick={handleImageUpload} disabled={!imageFile}>
              Upload Picture
            </Button>
          </div>
        </div>
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">Personal Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
