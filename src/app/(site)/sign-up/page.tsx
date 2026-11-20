"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ApiClientError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"customer" | "vendor">("customer");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Better Auth sign-up (sets session cookie)
      await api.post("/api/auth/sign-up/email", {
        name,
        email,
        password,
        role,
      });
      // Issue our JWT
      const data = await api.post<{ token: string }>("/api/auth/jwt");
      if (data.token) {
        window.localStorage.setItem("pizzahub_token", data.token);
        toast.success("Account created");
        window.location.href = "/dashboard";
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message);
      } else {
        toast.error("Sign up failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <Card className="card-shape">
        <CardHeader className="text-center">
          <CardTitle className="text-h1">Create account</CardTitle>
          <CardDescription>Join PizzaHub and start ordering</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-body-sm text-muted-foreground">
                Min 6 characters, at least one uppercase and one lowercase letter
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Account role</Label>
              <select
                id="role"
                className="border border-input bg-input rounded-lg p-2 text-body-sm"
                value={role}
                onChange={(e) => setRole(e.target.value as "customer" | "vendor")}
              >
                <option value="customer">Customer — order pizza</option>
                <option value="vendor">Vendor — sell pizza</option>
              </select>
            </div>
            <Button
              type="submit"
              className="w-full btn-pill"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <Link href="/sign-in" className="text-body-sm text-primary">
            Already have an account? Sign in
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
}
