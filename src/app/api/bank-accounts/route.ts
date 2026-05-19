import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await prisma.bankAccount.findMany({
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(accounts);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { bankName, accountName, accountNumber, swiftCode, bankAddress, notes, isDefault } = body;

  if (!bankName?.trim() || !accountName?.trim() || !accountNumber?.trim()) {
    return NextResponse.json(
      { error: "bankName, accountName and accountNumber are required" },
      { status: 400 }
    );
  }

  const data: any = {
    bankName: bankName.trim(),
    accountName: accountName.trim(),
    accountNumber: accountNumber.trim(),
    swiftCode: swiftCode?.trim() || null,
    bankAddress: bankAddress?.trim() || null,
    notes: notes?.trim() || null,
    isDefault: isDefault === true,
  };

  if (data.isDefault) {
    await prisma.bankAccount.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }

  const account = await prisma.bankAccount.create({ data });
  return NextResponse.json(account, { status: 201 });
}
