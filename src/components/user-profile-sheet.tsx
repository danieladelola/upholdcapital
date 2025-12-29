"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { updateUserProfile } from "@/actions/user";

// This is a placeholder for the actual user data.
// In a real application, you would fetch this from your authentication provider or API.
const dummyUser = {
  id: "user_123",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "123-456-7890",
  address: "123 Main St, Anytown, USA",
  profileImage: "https://github.com/shadcn.png",
};

export function UserProfileSheet() {
  const [user, setUser] = useState(dummyUser);
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

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const result = await updateUserProfile(user.id, formData);

    if (result.success) {
      setSuccess("Profile updated successfully!");
      // Optionally, update the user state with the new data
      if (result.user) {
        setUser((prevUser) => ({ ...prevUser, ...result.user }));
      }
    } else {
      // setError(result.error);
    }

    setLoading(false);
  };

  return (
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Personal Settings</SheetTitle>
      </SheetHeader>
      <div className="py-4">
        <div className="grid grid-cols-1 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Profile Picture</h2>
            <div className="flex flex-col items-center">
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full mb-4 object-cover"
              />
              <Button>Change Picture</Button>
              <p className="text-sm text-gray-500 mt-2">
                (Image upload not implemented yet)
              </p>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Personal Information
            </h2>
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
              {error && <p className="text-red-500">{error}</p>}
              {success && <p className="text-green-500">{success}</p>}
            </form>
          </div>
        </div>
      </div>
      <SheetFooter>
        <SheetClose asChild>
          <Button variant="outline">Close</Button>
        </SheetClose>
        <Button onClick={() => handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
        </Button>
      </SheetFooter>
    </SheetContent>
  );
}
