"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step7Schema, type Step7Data } from "@/lib/quotation-schema";
import { useWizardStore } from "@/stores/quotation-wizard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step7Summary({ onNext, onBack }: StepProps) {
  const { step5, step7, setStepData } = useWizardStore();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step7Data>({
    resolver: zodResolver(step7Schema),
    defaultValues: step7,
  });

  const totalArea = watch("totalArea");
  const productSubtotal = watch("productSubtotal");
  const accessoriesPackingFee = watch("accessoriesPackingFee");
  const shippingCost = watch("shippingCost");
  const discount = watch("discount");
  const grandTotal = watch("grandTotal");

  // Auto-calculate from step 5 items
  useEffect(() => {
    const items = step5.items || [];
    const calculatedArea = items.reduce((sum, item) => sum + (Number(item.area) || 0) * (Number(item.quantity) || 0), 0);
    const calculatedSubtotal = items.reduce((sum, item) => sum + (Number(item.finalAmount) || 0), 0);

    if (!totalArea || totalArea === 0) {
      setValue("totalArea", Number(calculatedArea.toFixed(4)));
    }
    if (!productSubtotal || productSubtotal === 0) {
      setValue("productSubtotal", Number(calculatedSubtotal.toFixed(2)));
    }
  }, [step5.items, setValue, totalArea, productSubtotal]);

  // Auto-calculate grand total
  useEffect(() => {
    const subtotal = Number(productSubtotal) || 0;
    const accessories = Number(accessoriesPackingFee) || 0;
    const shipping = Number(shippingCost) || 0;
    const disc = Number(discount) || 0;
    const total = subtotal + accessories + shipping - disc;
    setValue("grandTotal", Number(total.toFixed(2)));
  }, [productSubtotal, accessoriesPackingFee, shippingCost, discount, setValue]);

  function onSubmit(data: Step7Data) {
    setStepData("step7", data);
    onNext();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Price Summary</h3>
        <p className="text-sm text-muted-foreground">
          Review and adjust the pricing breakdown.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="totalArea">Total Area (m²)</Label>
          <Input
            id="totalArea"
            {...register("totalArea", { valueAsNumber: true })}
            type="number"
            step="0.0001"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="productSubtotal">Product Subtotal</Label>
          <Input
            id="productSubtotal"
            {...register("productSubtotal", { valueAsNumber: true })}
            type="number"
            step="0.01"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accessoriesPackingFee">Accessories / Packing Fee</Label>
          <Input
            id="accessoriesPackingFee"
            {...register("accessoriesPackingFee", { valueAsNumber: true })}
            type="number"
            step="0.01"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="shippingCost">Shipping Cost</Label>
          <Input
            id="shippingCost"
            {...register("shippingCost", { valueAsNumber: true })}
            type="number"
            step="0.01"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount">Discount</Label>
          <Input
            id="discount"
            {...register("discount", { valueAsNumber: true })}
            type="number"
            step="0.01"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grandTotal">Grand Total</Label>
          <Input
            id="grandTotal"
            {...register("grandTotal", { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="font-semibold"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Next</Button>
      </div>
    </form>
  );
}
