"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

function toNum(value: unknown): number | undefined {
  if (value == null) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  if (typeof value === "object" && value !== null) {
    const v = value as Record<string, unknown>;
    if (Array.isArray(v.d) && typeof v.e === "number" && typeof v.s === "number") {
      const digits = (v.d as number[]).join("");
      const exp = v.e as number;
      const sign = v.s as number;
      let num = Number(digits);
      if (exp !== 0) num = num * Math.pow(10, exp);
      return num * sign;
    }
    if ("toNumber" in v && typeof v.toNumber === "function") {
      return (v as { toNumber: () => number }).toNumber();
    }
  }
  return Number(value);
}
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  FileSpreadsheet,
  Plus,
  Search,
  Eye,
  Pencil,
  Copy,
  Trash2,
  Loader2,
  Download,
} from "lucide-react";

interface QuotationListItem {
  id: string;
  quoteNo: string;
  status: string;
  clientName: string;
  companyName: string | null;
  projectName: string;
  quoteDate: string;
  currency: string;
  grandTotal: number;
  createdAt: string;
  _count: { items: number };
}

type ExportType = "pdf" | "excel" | null;

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<QuotationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportingType, setExportingType] = useState<ExportType>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);

  async function fetchQuotations() {
    setLoading(true);
    try {
      const res = await fetch("/api/quotations");
      if (!res.ok) throw new Error("Failed to load quotations");
      const data = await res.json();
      setQuotations(data);
    } catch {
      setMessage("Failed to load quotations. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuotations();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return quotations;
    return quotations.filter(
      (item) =>
        item.quoteNo.toLowerCase().includes(q) ||
        item.clientName.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q) ||
        (item.companyName && item.companyName.toLowerCase().includes(q))
    );
  }, [quotations, search]);

  function statusBadge(status: string) {
    switch (status) {
      case "DRAFT":
        return (
          <Badge variant="secondary" className="capitalize">
            Draft
          </Badge>
        );
      case "GENERATED":
        return (
          <Badge variant="default" className="capitalize">
            Generated
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" className="capitalize">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this quotation?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/quotations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setQuotations((prev) => prev.filter((q) => q.id !== id));
      setMessage("Quotation deleted.");
    } catch {
      setMessage("Delete failed. Please try again.");
    } finally {
      setDeletingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleCopy(id: string) {
    setCopyingId(id);
    try {
      const res = await fetch(`/api/quotations/${id}`);
      if (!res.ok) throw new Error("Copy failed");
      const data = await res.json();

      const copyBody = {
        step1: {
          clientName: data.clientName,
          companyName: data.companyName || undefined,
          country: data.country,
          city: data.city || undefined,
          clientEmail: data.clientEmail || undefined,
          clientWhatsapp: data.clientWhatsapp || undefined,
          clientType: data.clientType || undefined,
          leadSource: data.leadSource || undefined,
        },
        step2: {
          projectName: data.projectName + " (Copy)",
          projectAddress: data.projectAddress || undefined,
          projectType: data.projectType || undefined,
          projectStage: data.projectStage || undefined,
          hasDrawings: data.hasDrawings || false,
          expectedPurchaseTime: data.expectedPurchaseTime || undefined,
        },
        step3: {
          quoteDate: new Date().toISOString().slice(0, 10),
          quoteValidity: data.quoteValidity || undefined,
          currency: data.currency || "USD",
          tradeTerm: data.tradeTerm || "EXW",
          productionLeadTime: data.productionLeadTime || undefined,
          paymentTerm: data.paymentTerm || undefined,
        },
        step4: {
          profileSeries: data.profileSeries || undefined,
          frameColor: data.frameColor || undefined,
          surfaceTreatment: data.surfaceTreatment || undefined,
          glassSpecification: data.glassSpecification || undefined,
          hardwareBrand: data.hardwareBrand || undefined,
          screenType: data.screenType || undefined,
          installationMethod: data.installationMethod || undefined,
          certifications: data.certifications || [],
        },
        step5: {
          items: (data.items || []).map((item: any) => ({
            itemNo: item.itemNo,
            windowDoorId: item.windowDoorId || undefined,
            productType: item.productType,
            width: item.width || undefined,
            height: item.height || undefined,
            quantity: item.quantity || 1,
            area: toNum(item.area) ?? undefined,
            finalUnitPrice: toNum(item.finalUnitPrice) ?? undefined,
            finalAmount: toNum(item.finalAmount) ?? undefined,
            openingWay: item.openingWay || undefined,
            notes: item.notes || undefined,
          })),
        },
        step6: {
          itemImages: (data.items || []).flatMap((item: any) =>
            (item.images || []).map((img: any) => ({
              id: img.id,
              quotationItemId: String(item.itemNo),
              filePath: img.filePath,
              description: img.description || undefined,
              isTbc: img.isTbc,
              tbcNotes: img.tbcNotes || undefined,
              sortOrder: img.sortOrder,
            }))
          ),
        },
        step7: {
          totalArea: toNum(data.totalArea) ?? undefined,
          productSubtotal: toNum(data.productSubtotal) ?? undefined,
          accessoriesPackingFee: toNum(data.accessoriesPackingFee) ?? undefined,
          shippingCost: toNum(data.shippingCost) ?? undefined,
          discount: toNum(data.discount) ?? undefined,
          grandTotal: toNum(data.grandTotal) ?? undefined,
        },
        step8: {
          termsAndConditions: data.termsAndConditions || undefined,
          notes: data.notes || undefined,
          tbcSummary: data.tbcSummary || undefined,
        },
      };

      const postRes = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(copyBody),
      });
      if (!postRes.ok) throw new Error("Copy save failed");
      const newQ = await postRes.json();
      setQuotations((prev) => [newQ, ...prev]);
      setMessage(`Copied as ${newQ.quoteNo}.`);
    } catch {
      setMessage("Copy failed. Please try again.");
    } finally {
      setCopyingId(null);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleExport(id: string, quoteNo: string, type: "pdf" | "excel") {
    setExportingId(id);
    setExportingType(type);
    try {
      const res = await fetch(`/api/quotations/${id}/${type}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Export failed" }));
        setMessage(err.error || "Export failed");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = type === "pdf" ? "pdf" : "xlsx";
      a.download = `${quoteNo}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setMessage("Export failed. Please try again.");
    } finally {
      setExportingId(null);
      setExportingType(null);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Quotations</h1>
          <p className="text-sm text-muted-foreground">
            Manage and export your saved quotations.
          </p>
        </div>
        <Link href="/quotations/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Quotation
          </Button>
        </Link>
      </div>

      {message && (
        <div className="rounded-md border bg-muted px-4 py-2 text-sm text-muted-foreground">
          {message}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by quote number, client, or project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote No.</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    <span className="mt-2 block text-sm">Loading quotations...</span>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    {search ? "No quotations match your search." : "No quotations yet. Create your first one!"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.quoteNo}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{q.clientName}</span>
                        {q.companyName && (
                          <span className="text-xs text-muted-foreground">{q.companyName}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{q.projectName}</TableCell>
                    <TableCell>
                      {q.quoteDate
                        ? new Date(q.quoteDate).toLocaleDateString("en-GB")
                        : "-"}
                    </TableCell>
                    <TableCell>{statusBadge(q.status)}</TableCell>
                    <TableCell className="text-right">{q._count.items}</TableCell>
                    <TableCell className="text-right">
                      {q.currency} {toNum(q.grandTotal)?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="View"
                          onClick={() => router.push(`/quotations/${q.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Edit"
                          onClick={() => router.push(`/quotations/${q.id}/edit`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Copy"
                          disabled={copyingId === q.id}
                          onClick={() => handleCopy(q.id)}
                        >
                          {copyingId === q.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Export PDF"
                          disabled={exportingId === q.id}
                          onClick={() => handleExport(q.id, q.quoteNo, "pdf")}
                        >
                          {exportingId === q.id && exportingType === "pdf" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Export Excel"
                          disabled={exportingId === q.id}
                          onClick={() => handleExport(q.id, q.quoteNo, "excel")}
                        >
                          {exportingId === q.id && exportingType === "excel" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FileSpreadsheet className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          title="Delete"
                          disabled={deletingId === q.id}
                          onClick={() => handleDelete(q.id)}
                        >
                          {deletingId === q.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
