"use client";

import { useState } from "react";
import { useWizardStore } from "@/stores/quotation-wizard-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText, FileSpreadsheet, Loader2, Save } from "lucide-react";

interface StepProps {
  onBack: () => void;
}

type ExportType = "pdf" | "excel" | null;

export function Step8Preview({ onBack }: StepProps) {
  const data = useWizardStore((s) => s.getAllData());
  const quotationId = useWizardStore((s) => s.quotationId);
  const [exporting, setExporting] = useState<ExportType>(null);
  const [savedQuoteNo, setSavedQuoteNo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave(): Promise<string | null> {
    setSaving(true);
    try {
      if (quotationId) {
        // Edit mode: PUT update
        const res = await fetch(`/api/quotations/${quotationId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Update failed" }));
          alert(err.error || "Update failed");
          return null;
        }
        const quotation = await res.json();
        setSavedQuoteNo(quotation.quoteNo);
        return quotation.id;
      }

      // New mode: POST create
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Save failed" }));
        alert(err.error || "Save failed");
        return null;
      }

      const quotation = await res.json();
      setSavedQuoteNo(quotation.quoteNo);
      return quotation.id;
    } catch (err) {
      console.error("Save error:", err);
      alert("Save failed. Please try again.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleExport(type: "pdf" | "excel") {
    setExporting(type);
    try {
      let activeQuotationId: string | null = quotationId;

      if (!activeQuotationId) {
        activeQuotationId = await handleSave();
        if (!activeQuotationId) {
          setExporting(null);
          return;
        }
      } else if (savedQuoteNo) {
        // Already saved in this session, ensure we have latest data
        await handleSave();
      }

      const res = await fetch(`/api/quotations/${activeQuotationId}/${type}`);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Export failed" }));
        alert(err.error || "Export failed");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = type === "pdf" ? "pdf" : "xlsx";
      const quoteNo = savedQuoteNo || data.step1.clientName || "Quotation";
      a.download = `${quoteNo}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Export failed. Please try again.");
    } finally {
      setExporting(null);
    }
  }

  const { step1, step2, step3, step4, step5, step6, step7, step8 } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Preview & Export</h3>
          <p className="text-sm text-muted-foreground">
            Review all information before exporting the quotation.
          </p>
          {savedQuoteNo && (
            <p className="mt-1 text-sm font-medium text-primary">
              Saved as: {savedQuoteNo}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSave}
            disabled={saving || !!exporting}
            className="gap-2"
            variant="secondary"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving
              ? quotationId
                ? "Updating..."
                : "Saving..."
              : quotationId
                ? "Update Only"
                : "Save Only"}
          </Button>
          <Button
            onClick={() => handleExport("pdf")}
            disabled={!!exporting || saving}
            className="gap-2"
            variant="default"
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
            disabled={!!exporting || saving}
            className="gap-2"
            variant="outline"
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Client Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {step1.clientName}</p>
            {step1.companyName && <p><span className="text-muted-foreground">Company:</span> {step1.companyName}</p>}
            <p><span className="text-muted-foreground">Country:</span> {step1.country}</p>
            {step1.clientEmail && <p><span className="text-muted-foreground">Email:</span> {step1.clientEmail}</p>}
            {step1.clientWhatsapp && <p><span className="text-muted-foreground">WhatsApp:</span> {step1.clientWhatsapp}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Project Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {step2.projectName}</p>
            {step2.projectAddress && <p><span className="text-muted-foreground">Address:</span> {step2.projectAddress}</p>}
            {step2.projectType && <p><span className="text-muted-foreground">Type:</span> {step2.projectType}</p>}
            {step2.projectStage && <p><span className="text-muted-foreground">Stage:</span> {step2.projectStage}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Quotation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p><span className="text-muted-foreground">Date:</span> {step3.quoteDate ? new Date(step3.quoteDate).toLocaleDateString("en-GB") : "-"}</p>
            <p><span className="text-muted-foreground">Currency:</span> {step3.currency}</p>
            <p><span className="text-muted-foreground">Trade Term:</span> {step3.tradeTerm}</p>
            {step3.paymentTerm && <p><span className="text-muted-foreground">Payment:</span> {step3.paymentTerm}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Specification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {step4.profileSeries && <p><span className="text-muted-foreground">Series:</span> {step4.profileSeries}</p>}
            {step4.frameColor && <p><span className="text-muted-foreground">Color:</span> {step4.frameColor}</p>}
            {step4.surfaceTreatment && <p><span className="text-muted-foreground">Surface:</span> {step4.surfaceTreatment}</p>}
            {step4.glassSpecification && <p><span className="text-muted-foreground">Glass:</span> {step4.glassSpecification}</p>}
            {(step4.certifications || []).length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {(step4.certifications || []).map((c) => (
                  <Badge key={c} variant="secondary">{c}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Product Items ({step5.items.length})</CardTitle>
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
                {step5.items.map((item) => (
                  <tr key={item.itemNo} className="border-b last:border-0">
                    <td className="py-2">{item.itemNo}</td>
                    <td className="py-2">{item.windowDoorId || "-"}</td>
                    <td className="py-2">{item.productType}</td>
                    <td className="py-2 text-right">
                      {item.width && item.height ? `${item.width}×${item.height}` : "-"}
                    </td>
                    <td className="py-2 text-right">{item.quantity}</td>
                    <td className="py-2 text-right">{item.area?.toFixed(4)}</td>
                    <td className="py-2 text-right">{item.finalUnitPrice?.toFixed(2)}</td>
                    <td className="py-2 text-right font-medium">{item.finalAmount?.toFixed(2)}</td>
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
            <span>{step7.totalArea?.toFixed(4)} m²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Product Subtotal</span>
            <span>{step3.currency} {step7.productSubtotal?.toFixed(2)}</span>
          </div>
          {step7.accessoriesPackingFee ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accessories / Packing</span>
              <span>{step3.currency} {step7.accessoriesPackingFee?.toFixed(2)}</span>
            </div>
          ) : null}
          {step7.shippingCost ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{step3.currency} {step7.shippingCost?.toFixed(2)}</span>
            </div>
          ) : null}
          {step7.discount ? (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-destructive">- {step3.currency} {step7.discount?.toFixed(2)}</span>
            </div>
          ) : null}
          <Separator />
          <div className="flex justify-between text-base font-semibold">
            <span>Grand Total</span>
            <span>{step3.currency} {step7.grandTotal?.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}
