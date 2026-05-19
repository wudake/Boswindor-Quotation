import { prisma } from "./prisma";

export async function generateQuoteNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

  const prefix = `BW-Q-${dateStr}-`;

  // Find the highest sequence number for today
  const latest = await prisma.quotation.findFirst({
    where: {
      quoteNo: { startsWith: prefix },
    },
    orderBy: {
      quoteNo: "desc",
    },
    select: {
      quoteNo: true,
    },
  });

  let seq = 1;
  if (latest) {
    const match = latest.quoteNo.match(/-(\d{3})$/);
    if (match) {
      seq = parseInt(match[1], 10) + 1;
    }
  }

  return `${prefix}${String(seq).padStart(3, "0")}`;
}
