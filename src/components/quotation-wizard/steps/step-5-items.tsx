"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step5Schema, type Step5Data } from "@/lib/quotation-schema";
import { useWizardStore } from "@/stores/quotation-wizard-store";
import { useConfigurationOptions } from "@/hooks/use-configuration-options";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

export function Step5Items({ onNext, onBack }: StepProps) {
  const { step5, setStepData } = useWizardStore();
  const { options: productTypeOptions } = useConfigurationOptions("PRODUCT_TYPE");
  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: step5,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");

  // Auto-calculate area and amount
  useEffect(() => {
    items?.forEach((item, index) => {
      const width = Number(item.width) || 0;
      const height = Number(item.height) || 0;
      const qty = Number(item.quantity) || 0;
      const price = Number(item.finalUnitPrice) || 0;

      if (width > 0 && height > 0) {
        const area = (width * height) / 1000000;
        setValue(`items.${index}.area`, Number(area.toFixed(4)));
      }

      const area = Number(item.area) || 0;
      if (area > 0 && price > 0) {
        const amount = area * price * qty;
        setValue(`items.${index}.finalAmount`, Number(amount.toFixed(2)));
      }
    });
  }, [items, setValue]);

  function onSubmit(data: Step5Data) {
    setStepData("step5", data);
    onNext();
  }

  function addItem() {
    append({
      itemNo: fields.length + 1,
      windowDoorId: `W${String(fields.length + 1).padStart(2, "0")}`,
      productType: "",
      width: undefined,
      height: undefined,
      quantity: 1,
      area: 0,
      finalUnitPrice: undefined,
      finalAmount: 0,
      openingWay: "",
      notes: "",
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Items</h3>
        <Button type="button" variant="outline" size="sm" onClick={addItem}>
          <Plus className="mr-1 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {errors.items && (
        <p className="text-sm text-destructive">{errors.items.message}</p>
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">No.</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Width</TableHead>
              <TableHead>Height</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Opening</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">
                  No items yet. Click "Add Item" to start.
                </TableCell>
              </TableRow>
            )}
            {fields.map((field, index) => (
              <TableRow key={field.id}>
                <TableCell>
                  <Input
                    {...register(`items.${index}.itemNo`)}
                    className="h-8 w-12 px-1 text-center"
                    readOnly
                  />
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`items.${index}.windowDoorId`)}
                    className="h-8 w-20 px-2"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={items?.[index]?.productType || ""}
                    onValueChange={(v) => setValue(`items.${index}.productType`, v || "")}
                  >
                    <SelectTrigger className="h-8 w-36">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`items.${index}.width`, { valueAsNumber: true })}
                    type="number"
                    className="h-8 w-20 px-2"
                    placeholder="mm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`items.${index}.height`, { valueAsNumber: true })}
                    type="number"
                    className="h-8 w-20 px-2"
                    placeholder="mm"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    type="number"
                    className="h-8 w-16 px-2"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`items.${index}.area`, { valueAsNumber: true })}
                    type="number"
                    step="0.0001"
                    className="h-8 w-20 px-2"
                    readOnly
                  />
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`items.${index}.finalUnitPrice`, { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="h-8 w-24 px-2"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`items.${index}.finalAmount`, { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="h-8 w-24 px-2"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    {...register(`items.${index}.openingWay`)}
                    className="h-8 w-24 px-2"
                    placeholder="e.g. 2/2/1"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
