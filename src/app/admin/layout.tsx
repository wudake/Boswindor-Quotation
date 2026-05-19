import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b pb-4">
        <h1 className="text-xl font-bold">Admin</h1>
        <nav className="flex gap-2">
          <Link href="/admin">
            <Button variant="ghost" size="sm">Overview</Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="ghost" size="sm">Users</Button>
          </Link>
          <Link href="/admin/configurations">
            <Button variant="ghost" size="sm">Configurations</Button>
          </Link>
          <Link href="/admin/company">
            <Button variant="ghost" size="sm">Company</Button>
          </Link>
        </nav>
      </div>
      {children}
    </div>
  );
}
