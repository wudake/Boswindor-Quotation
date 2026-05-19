import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companyInfo = await prisma.companyInfo.findFirst({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(companyInfo);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, address, phone, email, website, logoUrl, certificationsText } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const existing = await prisma.companyInfo.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });

  const data = {
    name: name.trim(),
    address: address?.trim() || null,
    phone: phone?.trim() || null,
    email: email?.trim() || null,
    website: website?.trim() || null,
    logoUrl: logoUrl?.trim() || null,
    certificationsText: certificationsText?.trim() || null,
  };

  if (existing) {
    const updated = await prisma.companyInfo.update({
      where: { id: existing.id },
      data,
    });
    return NextResponse.json(updated);
  }

  const created = await prisma.companyInfo.create({ data });
  return NextResponse.json(created, { status: 201 });
}
