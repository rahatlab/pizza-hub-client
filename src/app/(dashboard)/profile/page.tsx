"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { ApiClientError } from "@/lib/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/api/profile", { name, image });
      toast.success("Profile updated");
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <Card className="card-shape">
        <CardHeader>
          <CardTitle className="text-h1">Profile Settings</CardTitle>
          <CardDescription>Update your name and profile image.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Profile Image URL</Label>
              <Input id="image" type="url" placeholder="https://imgbb.com/..." value={image} onChange={(e) => setImage(e.target.value)} />
            </div>
            <p className="text-body-xs text-muted-foreground">
              Role and subscription plan cannot be changed here.
            </p>
            <Button type="submit" className="w-full btn-pill" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
