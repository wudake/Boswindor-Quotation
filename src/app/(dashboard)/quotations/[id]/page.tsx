"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Pencil, FileText, FileSpreadsheet } from "lucide-react";

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

interface QuotationDetail {
  id: string;
  quoteNo: string;
  status: string;
  clientName: string;
  companyName: string | null;
  country: string;
  city: string | null;
  clientEmail: string | null;
  clientWhatsapp: string | null;
  clientType: string | null;
  leadSource: string | null;
  projectName: string;
  projectAddress: string | null;
  projectType: string | null;
  projectStage: string | null;
  hasDrawings: boolean;
  expectedPurchaseTime: string | null;
  quoteDate: string;
  quoteValidity: string | null;
  currency: string;
  tradeTerm: string;
  productionLeadTime: string | null;
  paymentTerm: string | null;
  profileSeries: string | null;
  frameColor: string | null;
  surfaceTreatment: string | null;
  glassSpecification: string | null;
  hardwareBrand: string | null;
  screenType: string | null;
  installationMethod: string | null;
  certifications: string[];
  totalArea: number;
  productSubtotal: number;
  accessoriesPackingFee: number;
  shippingCost: number;
  discount: number;
  grandTotal: number;
  termsAndConditions: string | null;
  notes: string | null;
  tbcSummary: string | null;
  items: {
    id: string;
    itemNo: number;
    windowDoorId: string | null;
    productType: string;
    width: number | null;
    height: number | null;
    quantity: number;
    area: number | null;
    finalUnitPrice: number | null;
    finalAmount: number | null;
    openingWay: string | null;
    notes: string | null;
  }[];
}

type ExportType = "pdf" | "excel" | null;

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<ExportType>(null);

  useEffect(() => {
    async function fetchQuotation() {
      try {
        const res = await fetch(`/api/quotations/${id}`);
        if (!res.ok) throw new Error("Failed to load quotation");
        const data = await res.json();
        setQuotation(data);
      } catch {
        setError("Failed to load quotation.");
      } finally {
        setLoading(false);
      }
    }
    fetchQuotation();
  }, [id]);

  async function handleExport(type: "pdf" | "excel") {
    if (!quotation) return;
    setExporting(type);
    try {
      const res = await fetch(`/api/quotations/${id}/${type}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Export failed" }));
        setError(err.error || "Export failed");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = type === "pdf" ? "pdf" : "xlsx";
      a.download = `${quotation.quoteNo}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setExporting(null);
      setTimeout(() => setError(null), 3000);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Loading quotation...</p>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => router.push("/quotations")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p className="text-muted-foreground">{error || "Quotation not found."}</p>
      </div>
    );
  }

  const q = quotation;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/quotations")}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{q.quoteNo}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{new Date(q.quoteDate).toLocaleDateString("en-GB")}</span>
              <Badge variant={q.status === "GENERATED" ? "default" : q.status === "CANCELLED" ? "destructive" : "secondary"}>
                {q.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/quotations/${q.id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            onClick={() => handleExport("pdf")}
            disabled={!!exporting}
            className="gap-2"
          >
            {exporting === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {exporting === "pdf" ? "Generating..." : "Export PDF"}
          </Button>
          <Button
            onClick={() => handleExport("excel")}
            disabled={!!exporting}
            variant="outline"
            className="gap-2"
          >
            {exporting === "excel" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            {exporting === "excel" ? "Generating..." : "Export Excel"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border bg-muted px-4 py-2 text-sm text-muted-foreground">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {q.clientName}</p>
            {q.companyName && <p><span className="text-muted-foreground">Company:</span> {q.companyName}</p>}
            <p><span className="text-muted-foreground">Country:</span> {q.country}</p>
            {q.city && <p><span className="text-muted-foreground">City:</span> {q.city}</p>}
            {q.clientEmail && <p><span className="text-muted-foreground">Email:</span> {q.clientEmail}</p>}
            {q.clientWhatsapp && <p><span className="text-muted-foreground">WhatsApp:</span> {q.clientWhatsapp}</p>}
            {q.clientType && <p><span className="text-muted-foreground">Type:</span> {q.clientType}</p>}
            {q.leadSource && <p><span className="text-muted-foreground">Source:</span> {q.leadSource}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {q.projectName}</p>
            {q.projectAddress && <p><span className="text-muted-foreground">Address:</span> {q.projectAddress}</p>}
            {q.projectType && <p><span className="text-muted-foreground">Type:</span> {q.projectType}</p>}
            {q.projectStage && <p><span className="text-muted-foreground">Stage:</span> {q.projectStage}</p>}
            {q.expectedPurchaseTime && (
              <p><span className="text-muted-foreground">Purchase:</span> {q.expectedPurchaseTime}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quotation Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Date:</span> {new Date(q.quoteDate).toLocaleDateString("en-GB")}</p>
            <p><span className="text-muted-foreground">Currency:</span> {q.currency}</p>
            <p><span className="text-muted-foreground">Trade Term:</span> {q.tradeTerm}</p>
            {q.quoteValidity && <p><span className="text-muted-foreground">Validity:</span> {q.quoteValidity}</p>}
            {q.paymentTerm && <p><span className="text-muted-foreground">Payment:</span> {q.paymentTerm}</p>}
            {q.productionLeadTime && (
              <p><span className="text-muted-foreground">Lead Time:</span> {q.productionLeadTime}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Specification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {q.profileSeries && <p><span className="text-muted-foreground">Series:</span> {q.profileSeries}</p>}
            {q.frameColor && <p><span className="text-muted-foreground">Color:</span> {q.frameColor}</p>}
            {q.surfaceTreatment && <p><span className="text-muted-foreground">Surface:</span> {q.surfaceTreatment}</p>}
            {q.glassSpecification && <p><span className="text-muted-foreground">Glass:</span> {q.glassSpecification}</p>}
            {q.hardwareBrand && <p><span className="text-muted-foreground">Hardware:</span> {q.hardwareBrand}</p>}
            {q.screenType && <p><span className="text-muted-foreground">Screen:</span> {q.screenType}</p>}
            {q.installationMethod && <p><span className="text-muted-foreground">Installation:</span> {q.installationMethod}</p>}
            {q.certifications.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {q.certifications.map((c) => (
                  <Badge key={c} variant="secondary">{c}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Product Items ({q.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">No.</th>
                  <th className="pb-2 text-left font-medium">ID</th>
                  <th className="pb-2 text-left font-medium">Type</th>
                  <th className="pb-2 text-right font-medium">W×H</th>
                  <th className="pb-2 text-right font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Area</th>
                  <th className="pb-2 text-right font-medium">Price</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {q.items.map((item) => (
                  <tr key={item.itemNo} className="border-b last:border-0">
                    <td className="py-2">{item.itemNo}</td>
                    <td className="py-2">{item.windowDoorId || "-"}</td>
                    <td className="py-2">{item.productType}</td>
                    <td className="py-2 text-right">
                      {item.width && item.height ? `${item.width}×${item.height}` : "-"}
                    </td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">{toNum(item.area)?.toFixed(4)}</td>
                    <td className="py-2 text-right">{toNum(item.finalUnitPrice)?.toFixed(2)}</td>
                    <td className="py-2 text-right font-medium">{toNum(item.finalAmount)?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Price Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Area</span>
            <span>{toNum(q.totalArea)?.toFixed(4)} m²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Product Subtotal</span>
            <span>{q.currency} {toNum(q.productSubtotal)?.toFixed(2)}</span>
          </div>
          {q.accessoriesPackingFee ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accessories / Packing</span>
              <span>{q.currency} {toNum(q.accessoriesPackingFee)?.toFixed(2)}</span>
            </div>
          ) : null}
          {q.shippingCost ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{q.currency} {toNum(q.shippingCost)?.toFixed(2)}</span>
            </div>
          ) : null}
          {q.discount ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-destructive">- {q.currency} {toNum(q.discount)?.toFixed(2)}</span>
            </div>
          ) : null}
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>Grand Total</span>
            <span>{q.currency} {toNum(q.grandTotal)?.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {(q.notes || q.tbcSummary || q.termsAndConditions) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Notes & Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {q.notes && (
              <div>
                <p className="text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap">{q.notes}</p>
              </div>
            )}
            {q.tbcSummary && (
              <div>
                <p className="text-muted-foreground">TBC Summary</p>
                <p className="whitespace-pre-wrap text-destructive">{q.tbcSummary}</p>
              </div>
            )}
            {q.termsAndConditions && (
              <div>
                <p className="text-muted-foreground">Terms & Conditions</p>
                <p className="whitespace-pre-wrap">{q.termsAndConditions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
