import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const account = await prisma.bankAccount.findUnique({ where: { id } });
  if (!account) {
    return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
  }

  return NextResponse.json(account);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { bankName, accountName, accountNumber, swiftCode, bankAddress, notes, isDefault } = body;

  const data: Record<string, unknown> = {};
  if (bankName !== undefined) data.bankName = bankName.trim();
  if (accountName !== undefined) data.accountName = accountName.trim();
  if (accountNumber !== undefined) data.accountNumber = accountNumber.trim();
  if (swiftCode !== undefined) data.swiftCode = swiftCode?.trim() || null;
  if (bankAddress !== undefined) data.bankAddress = bankAddress?.trim() || null;
  if (notes !== undefined) data.notes = notes?.trim() || null;
  if (isDefault !== undefined) data.isDefault = isDefault === true;

  if (data.isDefault) {
    await prisma.bankAccount.updateMany({
      where: { isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
  }

  try {
    const account = await prisma.bankAccount.update({ where: { id }, data });
    return NextResponse.json(account);
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
    }
    console.error("Update bank account error:", error);
    return NextResponse.json({ error: "Failed to update bank account" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const deleting = await prisma.bankAccount.findUnique({ where: { id } });
  if (!deleting) {
    return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
  }

  try {
    await prisma.bankAccount.delete({ where: { id } });

    if (deleting.isDefault) {
      const nextDefault = await prisma.bankAccount.findFirst({
        orderBy: { createdAt: "desc" },
      });
      if (nextDefault) {
        await prisma.bankAccount.update({
          where: { id: nextDefault.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete bank account error:", error);
    return NextResponse.json({ error: "Failed to delete bank account" }, { status: 500 });
  }
}
