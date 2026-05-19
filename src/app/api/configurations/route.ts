import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const where = category ? { category: category as any } : {};

  const configs = await prisma.configurationOption.findMany({
    where,
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }, { label: "asc" }],
  });

  return NextResponse.json(configs);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { category, value, label, labelEn, sortOrder } = body;

  if (!category || !value || !label) {
    return NextResponse.json(
      { error: "category, value and label are required" },
      { status: 400 }
    );
  }

  try {
    const config = await prisma.configurationOption.create({
      data: {
        category,
        value,
        label,
        labelEn: labelEn || null,
        sortOrder: sortOrder || 0,
        isActive: true,
      },
    });
    return NextResponse.json(config, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "This value already exists for the category" },
        { status: 409 }
      );
    }
    console.error("Create config error:", error);
    return NextResponse.json(
      { error: "Failed to create configuration" },
      { status: 500 }
    );
  }
}
