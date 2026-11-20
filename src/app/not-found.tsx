import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-md px-4 py-16 sm:px-6 text-center">
      <Card className="card-shape mx-auto max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold text-primary">404</CardTitle>
          <CardDescription>Page not found</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-body-sm text-muted-foreground mb-8">
            The page you’re looking for doesn’t exist.
          </p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full btn-pill">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
