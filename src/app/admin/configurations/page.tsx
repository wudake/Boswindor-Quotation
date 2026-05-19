"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Pencil, X, Check } from "lucide-react";

const CATEGORIES = [
  { value: "CLIENT_TYPE", label: "Client Type" },
  { value: "LEAD_SOURCE", label: "Lead Source" },
  { value: "PROJECT_TYPE", label: "Project Type" },
  { value: "PROJECT_STAGE", label: "Project Stage" },
  { value: "CURRENCY", label: "Currency" },
  { value: "TRADE_TERM", label: "Trade Term" },
  { value: "PAYMENT_TERM", label: "Payment Term" },
  { value: "PROFILE_SERIES", label: "Profile Series" },
  { value: "FRAME_COLOR", label: "Frame Color" },
  { value: "SURFACE_TREATMENT", label: "Surface Treatment" },
  { value: "GLASS_SPECIFICATION", label: "Glass Specification" },
  { value: "HARDWARE_BRAND", label: "Hardware Brand" },
  { value: "SCREEN_TYPE", label: "Screen Type" },
  { value: "INSTALLATION_METHOD", label: "Installation Method" },
  { value: "CERTIFICATION", label: "Certification" },
  { value: "PRODUCT_TYPE", label: "Product Type" },
];

interface ConfigItem {
  id: string;
  category: string;
  value: string;
  label: string;
  labelEn: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function ConfigurationsPage() {
  const [items, setItems] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].value);

  // Form state
  const [formCategory, setFormCategory] = useState(CATEGORIES[0].value);
  const [formValue, setFormValue] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formLabelEn, setFormLabelEn] = useState("");
  const [formSortOrder, setFormSortOrder] = useState("0");
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editLabelEn, setEditLabelEn] = useState("");
  const [editSortOrder, setEditSortOrder] = useState("");
  const [editActive, setEditActive] = useState(true);

  async function fetchAll() {
    setLoading(true);
    try {
      const res = await fetch("/api/configurations");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      setMessage("加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(
    () => items.filter((i) => i.category === activeCategory),
    [items, activeCategory]
  );

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!formValue.trim() || !formLabel.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/configurations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formCategory,
          value: formValue.trim(),
          label: formLabel.trim(),
          labelEn: formLabelEn.trim() || null,
          sortOrder: Number(formSortOrder) || 0,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "添加失败" }));
        setMessage(err.error || "添加失败");
        return;
      }
      setFormValue("");
      setFormLabel("");
      setFormLabelEn("");
      setFormSortOrder("0");
      setActiveCategory(formCategory);
      await fetchAll();
      setMessage("添加成功");
    } catch {
      setMessage("添加失败");
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleUpdate(id: string) {
    try {
      const res = await fetch(`/api/configurations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: editLabel.trim(),
          labelEn: editLabelEn.trim() || null,
          sortOrder: Number(editSortOrder) || 0,
          isActive: editActive,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      setEditingId(null);
      await fetchAll();
      setMessage("更新成功");
    } catch {
      setMessage("更新失败");
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("确认删除此选项？")) return;
    try {
      const res = await fetch(`/api/configurations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      await fetchAll();
      setMessage("删除成功");
    } catch {
      setMessage("删除失败");
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  }

  function startEdit(item: ConfigItem) {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditLabelEn(item.labelEn || "");
    setEditSortOrder(String(item.sortOrder));
    setEditActive(item.isActive);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Configuration Options</h2>
        <p className="text-sm text-muted-foreground">
          管理报价向导中所有下拉选项的基础数据。业务员只能使用此处配置的选项。
        </p>
      </div>

      {message && (
        <div className="rounded-md border bg-muted px-4 py-2 text-sm text-muted-foreground">
          {message}
        </div>
      )}

      {/* Add Form */}
      <form
        onSubmit={handleAdd}
        className="rounded-lg border bg-card p-4 shadow-sm space-y-4"
      >
        <h3 className="text-sm font-medium">添加新选项</h3>
        <div className="grid gap-4 sm:grid-cols-5">
          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <select
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Value *</Label>
            <Input
              placeholder="存储值"
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Label *</Label>
            <Input
              placeholder="显示文本"
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Label EN</Label>
            <Input
              placeholder="英文标签（可选）"
              value={formLabelEn}
              onChange={(e) => setFormLabelEn(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sort Order</Label>
            <Input
              type="number"
              value={formSortOrder}
              onChange={(e) => setFormSortOrder(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting} className="gap-2">
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            添加
          </Button>
        </div>
      </form>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <Button
            key={c.value}
            variant={activeCategory === c.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(c.value)}
          >
            {c.label}
            <Badge variant="secondary" className="ml-1 text-[10px]">
              {items.filter((i) => i.category === c.value).length}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Value</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Label EN</TableHead>
                <TableHead className="text-right">Sort</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    该分类下暂无选项
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((item) => (
                  <TableRow key={item.id}>
                    {editingId === item.id ? (
                      <>
                        <TableCell className="font-medium">{item.value}</TableCell>
                        <TableCell>
                          <Input
                            size-alias="sm"
                            className="h-8"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            className="h-8"
                            value={editLabelEn}
                            onChange={(e) => setEditLabelEn(e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            className="h-8 w-16 ml-auto"
                            type="number"
                            value={editSortOrder}
                            onChange={(e) => setEditSortOrder(e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editActive}
                              onChange={(e) => setEditActive(e.target.checked)}
                              className="h-4 w-4"
                            />
                            {editActive ? "Active" : "Inactive"}
                          </label>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdate(item.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">{item.value}</TableCell>
                        <TableCell>{item.label}</TableCell>
                        <TableCell>{item.labelEn || "-"}</TableCell>
                        <TableCell className="text-right">{item.sortOrder}</TableCell>
                        <TableCell>
                          <Badge variant={item.isActive ? "default" : "secondary"}>
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => startEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
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
