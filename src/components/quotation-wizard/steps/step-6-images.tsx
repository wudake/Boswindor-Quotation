"use client";

import { useState } from "react";
import { useWizardStore } from "@/stores/quotation-wizard-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step6Images({ onNext, onBack }: StepProps) {
  const { step5, step6, setStepData } = useWizardStore();
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    itemId: string
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingItemId(itemId);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        const newImage = {
          quotationItemId: itemId,
          filePath: data.filePath,
          description: "",
          isTbc: false,
          tbcNotes: "",
          sortOrder: (step6.itemImages || []).length,
        };
        setStepData("step6", {
          itemImages: [...(step6.itemImages || []), newImage],
        });
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploadingItemId(null);
    }
  }

  function updateImage(index: number, field: string, value: any) {
    const updated = [...(step6.itemImages || [])];
    updated[index] = { ...updated[index], [field]: value };
    setStepData("step6", { itemImages: updated });
  }

  function removeImage(index: number) {
    const updated = (step6.itemImages || []).filter((_, i) => i !== index);
    setStepData("step6", { itemImages: updated });
  }

  function handleContinue() {
    onNext();
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Product Images & Drawings</h3>
        <p className="text-sm text-muted-foreground">
          Upload images for each product item. Mark TBC items with notes.
        </p>
      </div>

      <ScrollArea className="h-[400px] rounded-md border p-4">
        <div className="space-y-6">
          {step5.items.map((item) => (
            <div key={item.id || item.itemNo} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">
                    {item.windowDoorId || `Item ${item.itemNo}`}
                  </span>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {item.productType}
                  </span>
                </div>
                <Label className="cursor-pointer">
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(e, String(item.itemNo))
                    }
                    disabled={uploadingItemId === String(item.itemNo)}
                  />
                  <span className="inline-flex h-8 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground">
                    {uploadingItemId === String(item.itemNo)
                      ? "Uploading..."
                      : "Upload Image"}
                  </span>
                </Label>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(step6.itemImages || [])
                  .filter(
                    (img) =>
                      img.quotationItemId === String(item.itemNo)
                  )
                  .map((img, imgIndex) => {
                    const globalIndex = (step6.itemImages || []).indexOf(img);
                    return (
                      <div
                        key={globalIndex}
                        className="space-y-2 rounded-md border p-3"
                      >
                        <img
                          src={img.filePath}
                          alt="Product"
                          className="h-32 w-full rounded-md object-cover"
                        />
                        <Input
                          placeholder="Description"
                          value={img.description || ""}
                          onChange={(e) =>
                            updateImage(globalIndex, "description", e.target.value)
                          }
                        />
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`tbc-${globalIndex}`}
                            checked={img.isTbc}
                            onCheckedChange={(v) =>
                              updateImage(globalIndex, "isTbc", v === true)
                            }
                          />
                          <Label htmlFor={`tbc-${globalIndex}`}>TBC</Label>
                        </div>
                        {img.isTbc && (
                          <Textarea
                            placeholder="TBC notes..."
                            value={img.tbcNotes || ""}
                            onChange={(e) =>
                              updateImage(globalIndex, "tbcNotes", e.target.value)
                            }
                            rows={2}
                          />
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full text-destructive"
                          onClick={() => removeImage(globalIndex)}
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}

          {step5.items.length === 0 && (
            <p className="text-center text-muted-foreground">
              No product items to attach images to. Go back to Step 5.
            </p>
          )}
        </div>
      </ScrollArea>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleContinue}>
          Next
        </Button>
      </div>
    </div>
  );
}
