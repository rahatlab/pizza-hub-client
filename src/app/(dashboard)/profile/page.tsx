"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { useAuth, type AuthUser } from "@/components/auth/auth-provider";
import { Field } from "@/components/ui/field";
import { api } from "@/lib/api";
import { uploadImage } from "@/lib/upload";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState(user?.address ?? "");
  const [businessName, setBusinessName] = useState(user?.businessName ?? "");
  const [businessLocation, setBusinessLocation] = useState(user?.businessLocation ?? "");
  const [image, setImage] = useState(user?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const isVendor = user.role === "vendor";

  async function handlePhoto(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setImage(url);
      toast.success("Photo uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const data = await api<{ user: AuthUser }>("/api/account/profile", {
        method: "PATCH",
        body: {
          name,
          phone,
          address,
          image,
          ...(isVendor ? { businessName, businessLocation } : {}),
        },
      });
      setUser(data.user);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-neutral">Your profile</h1>
        <p className="mt-1 text-sm text-muted">
          Keep your details current so deliveries and payouts reach the right place.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="ph-card space-y-6 p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-line bg-sunken">
            {image ? (
              <Image
                src={image}
                alt="Your profile photo"
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <Camera className="h-6 w-6 text-faint" aria-hidden />
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline disabled:opacity-60"
            >
              {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
              Change photo
            </button>
            <p className="mt-1 text-xs text-faint">JPG or PNG · uploaded to ImgBB</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => void handlePhoto(event.target.files?.[0])}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="name" label="Full name" value={name} onChange={setName} autoComplete="name" />
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-neutral">
              Email
            </label>
            <input
              id="email"
              value={user.email}
              readOnly
              className="h-11 w-full cursor-not-allowed rounded-xl border border-line bg-sunken px-3.5 text-sm text-muted"
            />
          </div>
          <Field id="phone" label="Phone" value={phone} onChange={setPhone} autoComplete="tel" placeholder="+880 1X XXX XXXXX" />
          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-semibold text-neutral">
              Account type
            </label>
            <input
              id="role"
              value={user.role}
              readOnly
              className="h-11 w-full cursor-not-allowed rounded-xl border border-line bg-sunken px-3.5 text-sm capitalize text-muted"
            />
          </div>
        </div>

        <Field
          id="address"
          label="Delivery address"
          value={address}
          onChange={setAddress}
          placeholder="House, road, area, city"
          autoComplete="street-address"
        />

        {isVendor && (
          <div className="grid gap-4 rounded-xl border border-line bg-sunken/60 p-4 sm:grid-cols-2">
            <Field
              id="businessName"
              label="Restaurant name"
              value={businessName}
              onChange={setBusinessName}
            />
            <Field
              id="businessLocation"
              label="Location"
              value={businessLocation}
              onChange={setBusinessLocation}
            />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-strong disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
