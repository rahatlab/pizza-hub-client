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

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Better Auth sign-in (sets session cookie)
      await api.post("/api/auth/sign-in/email", {
        email,
        password,
      });
      // Issue our JWT
      const data = await api.post<{ token: string }>("/api/auth/jwt");
      if (data.token) {
        window.localStorage.setItem("pizzahub_token", data.token);
        toast.success("Signed in");
        window.location.href = "/dashboard";
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message);
      } else {
        toast.error("Sign in failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <Card className="card-shape">
        <CardHeader className="text-center">
          <CardTitle className="text-h1">Welcome back</CardTitle>
          <CardDescription>Sign in to your PizzaHub account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
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
            </div>
            <Button
              type="submit"
              className="w-full btn-pill"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center">
          <Link href="/sign-up" className="text-body-sm text-primary">
            Don't have an account? Sign up
          </Link>
        </CardFooter>
      </Card>
    </section>
  );
}
