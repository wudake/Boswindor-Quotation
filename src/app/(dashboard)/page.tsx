import { auth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user.name}
        </p>
      </div>
      <div className="flex gap-4">
        <Link href="/quotations/new">
          <Button>New Quotation</Button>
        </Link>
        <Link href="/quotations">
          <Button variant="outline">My Quotations</Button>
        </Link>
      </div>
    </div>
  );
}
