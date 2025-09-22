"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Save, Camera, FileText, Eye } from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, editProfile } = useAuth();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    oldPassword: "",
    newPassword: "",
    universityName: user?.universityName || "",
    contactNumber: user?.contactNumber || "",
    graduationYear: user?.graduationYear || "",
    profileUrl: null as File | null,
    documentLink: null as File | null,
  });

  const [previewImage, setPreviewImage] = useState(
    user?.profileUrl && user.profileUrl !== "" 
      ? (user.profileUrl.startsWith('/api/') 
          ? `http://localhost:4000${user.profileUrl}` 
          : user.profileUrl)
      : ""
  );

  // Helper function to handle document viewing with error handling
  const handleViewDocument = async (documentUrl: string) => {
    try {
      // Convert relative URLs to full backend URLs
      const fullUrl = documentUrl.startsWith('/api/') 
        ? `http://localhost:4000${documentUrl}`
        : documentUrl;
      
      const newWindow = window.open(fullUrl, '_blank');
      
      if (!newWindow) {
        alert('Popup blocked. Please allow popups for this site.');
        return;
      }
      
      console.log('Document opened:', fullUrl);
    } catch (error) {
      console.error('Error opening document:', error);
      alert('Error opening document. Please contact support if this issue persists.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    if (files) {
      const file = files[0];
      setFormData({ ...formData, [name]: file });
      if (name === "profileUrl") {
        setPreviewImage(URL.createObjectURL(file)); // Show preview immediately
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.contactNumber) {
      alert("Contact number cannot be empty");
      return;
    }

    if (formData.newPassword&& formData.newPassword.length < 5) {
        alert("Password should be atleast 5 characcters");
        return
      }

    const fd = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) fd.append(key, value as any);
    });

    try {
        const response = await editProfile(fd);

        if (response?.message === "Profile Updated Successfully") {
          alert(response.message);
            router.push("localhost:3000/dashboard/profile");
          return;
        }
        if (response?.message) {
          alert(response.message);
          return; 
        }
        
        
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Error updating profile");
      }
      
  };

  // generate graduation years
  const years = Array.from({ length: 2030 - 1998 + 1 }, (_, i) => 1998 + i);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Profile Header */}
      <Card className="shadow-md border-gray-200 dark:border-gray-700">
        <CardContent className="flex flex-col items-center py-8">
          <Avatar className="h-28 w-28">
            {previewImage ? (
              <AvatarImage src={previewImage} alt="Profile" />
            ) : (
              <AvatarFallback className="text-2xl font-bold">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="mt-4">
            <Label
              htmlFor="profileUrl"
              className="flex items-center gap-2 text-sm font-medium cursor-pointer text-primary hover:underline"
            >
              <Camera className="h-4 w-4" />
              Change Profile Picture
            </Label>
            <Input
              id="profileUrl"
              type="file"
              name="profileUrl"
              onChange={handleChange}
              className="hidden"
              accept="image/*"
            />
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="shadow-md border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
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
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Old + New Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="oldPassword">Old Password</Label>
                <Input
                  id="oldPassword"
                  type="password"
                  name="oldPassword"
                  value={formData.oldPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="universityName">University</Label>
              <Input
                id="universityName"
                name="universityName"
                value={formData.universityName}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="graduationYear">Graduation Year</Label>
              <select
                id="graduationYear"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                // onChange={handleChange}
                required
                onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setFormData({ ...formData, contactNumber: val });
                  }}
                  pattern="\d{10}"
                  maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentLink">Upload Document</Label>
              
              {/* Show current document if exists */}
              {user?.documentLink && (
                <div className="mb-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Current Document</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocument(user.documentLink)}
                      className="gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a new file below to replace this document
                  </p>
                </div>
              )}

              <Input
                id="documentLink"
                type="file"
                name="documentLink"
                onChange={handleChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-gray-500">
                Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG
              </p>
            </div>

            <Button type="submit" className="w-full gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
