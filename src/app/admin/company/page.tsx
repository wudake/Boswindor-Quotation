"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  Star,
  Building2,
  Landmark,
} from "lucide-react";

interface CompanyInfo {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  certificationsText?: string | null;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode?: string | null;
  bankAddress?: string | null;
  notes?: string | null;
  isDefault: boolean;
  createdAt: string;
}

export default function CompanyPage() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // Company info
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [compName, setCompName] = useState("");
  const [compAddress, setCompAddress] = useState("");
  const [compPhone, setCompPhone] = useState("");
  const [compEmail, setCompEmail] = useState("");
  const [compWebsite, setCompWebsite] = useState("");
  const [compLogoUrl, setCompLogoUrl] = useState("");
  const [compCerts, setCompCerts] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);

  // Bank accounts
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [showBankForm, setShowBankForm] = useState(false);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [bankName, setBankName] = useState("");
  const [bankAccName, setBankAccName] = useState("");
  const [bankAccNumber, setBankAccNumber] = useState("");
  const [bankSwift, setBankSwift] = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [bankNotes, setBankNotes] = useState("");
  const [bankIsDefault, setBankIsDefault] = useState(false);
  const [submittingBank, setSubmittingBank] = useState(false);

  async function fetchData() {
    setLoading(true);
    try {
      const [compRes, bankRes] = await Promise.all([
        fetch("/api/company-info"),
        fetch("/api/bank-accounts"),
      ]);
      if (compRes.ok) {
        const compData = await compRes.json();
        setCompany(compData);
        if (compData) {
          setCompName(compData.name || "");
          setCompAddress(compData.address || "");
          setCompPhone(compData.phone || "");
          setCompEmail(compData.email || "");
          setCompWebsite(compData.website || "");
          setCompLogoUrl(compData.logoUrl || "");
          setCompCerts(compData.certificationsText || "");
        }
      }
      if (bankRes.ok) {
        const bankData = await bankRes.json();
        setAccounts(bankData);
      }
    } catch {
      setMessage("加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [message]);

  async function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault();
    if (!compName.trim()) {
      setMessage("公司名称为必填项");
      return;
    }
    setSavingCompany(true);
    try {
      const res = await fetch("/api/company-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: compName.trim(),
          address: compAddress,
          phone: compPhone,
          email: compEmail,
          website: compWebsite,
          logoUrl: compLogoUrl,
          certificationsText: compCerts,
        }),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("公司信息保存成功");
      await fetchData();
    } catch {
      setMessage("公司信息保存失败");
    } finally {
      setSavingCompany(false);
    }
  }

  function resetBankForm() {
    setBankName("");
    setBankAccName("");
    setBankAccNumber("");
    setBankSwift("");
    setBankAddress("");
    setBankNotes("");
    setBankIsDefault(false);
    setIsEditingBank(false);
    setEditingBankId(null);
  }

  function openAddBankForm() {
    resetBankForm();
    setShowBankForm(true);
  }

  function openEditBankForm(acc: BankAccount) {
    setBankName(acc.bankName);
    setBankAccName(acc.accountName);
    setBankAccNumber(acc.accountNumber);
    setBankSwift(acc.swiftCode || "");
    setBankAddress(acc.bankAddress || "");
    setBankNotes(acc.notes || "");
    setBankIsDefault(acc.isDefault);
    setIsEditingBank(true);
    setEditingBankId(acc.id);
    setShowBankForm(true);
  }

  async function handleSubmitBank(e: React.FormEvent) {
    e.preventDefault();
    if (!bankName.trim() || !bankAccName.trim() || !bankAccNumber.trim()) {
      setMessage("银行名称、账户名称和账号为必填项");
      return;
    }
    setSubmittingBank(true);
    try {
      if (isEditingBank && editingBankId) {
        const res = await fetch(`/api/bank-accounts/${editingBankId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bankName: bankName.trim(),
            accountName: bankAccName.trim(),
            accountNumber: bankAccNumber.trim(),
            swiftCode: bankSwift,
            bankAddress: bankAddress,
            notes: bankNotes,
            isDefault: bankIsDefault,
          }),
        });
        if (!res.ok) throw new Error("Update failed");
        setMessage("银行账户更新成功");
      } else {
        const res = await fetch("/api/bank-accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bankName: bankName.trim(),
            accountName: bankAccName.trim(),
            accountNumber: bankAccNumber.trim(),
            swiftCode: bankSwift,
            bankAddress: bankAddress,
            notes: bankNotes,
            isDefault: bankIsDefault,
          }),
        });
        if (!res.ok) throw new Error("Create failed");
        setMessage("银行账户创建成功");
      }
      resetBankForm();
      setShowBankForm(false);
      await fetchData();
    } catch {
      setMessage(isEditingBank ? "银行账户更新失败" : "银行账户创建失败");
    } finally {
      setSubmittingBank(false);
    }
  }

  async function handleDeleteBank(id: string) {
    if (!window.confirm("确认删除此银行账户？此操作不可恢复。")) return;
    try {
      const res = await fetch(`/api/bank-accounts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setMessage("删除成功");
      await fetchData();
    } catch {
      setMessage("删除失败");
    }
  }

  async function handleSetDefaultBank(id: string) {
    try {
      const res = await fetch(`/api/bank-accounts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (!res.ok) throw new Error("Set default failed");
      setMessage("已设为默认账户");
      await fetchData();
    } catch {
      setMessage("设置默认账户失败");
    }
  }

  return (
    <div className="space-y-8">
      {message && (
        <div className="rounded-md border bg-muted px-4 py-2 text-sm text-muted-foreground">
          {message}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">
          <Loader2 className="mx-auto h-6 w-6 animate-spin" />
        </div>
      ) : (
        <>
          {/* Company Info */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">公司信息</h2>
              <p className="text-sm text-muted-foreground ml-2">
                此信息将显示在报价单 PDF/Excel 中。
              </p>
            </div>
            <form
              onSubmit={handleSaveCompany}
              className="rounded-lg border bg-card p-4 shadow-sm space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">公司名称 *</Label>
                  <Input
                    placeholder="Boswindor"
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">地址</Label>
                  <Input
                    placeholder="公司地址"
                    value={compAddress}
                    onChange={(e) => setCompAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">电话</Label>
                  <Input
                    placeholder="联系电话"
                    value={compPhone}
                    onChange={(e) => setCompPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">邮箱</Label>
                  <Input
                    type="email"
                    placeholder="contact@example.com"
                    value={compEmail}
                    onChange={(e) => setCompEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">网站</Label>
                  <Input
                    placeholder="https://www.example.com"
                    value={compWebsite}
                    onChange={(e) => setCompWebsite(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Logo URL</Label>
                  <Input
                    placeholder="Logo 图片链接"
                    value={compLogoUrl}
                    onChange={(e) => setCompLogoUrl(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">资质认证文本</Label>
                <Textarea
                  placeholder="例如：CE认证、ISO9001等"
                  value={compCerts}
                  onChange={(e) => setCompCerts(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={savingCompany}
                  className="gap-2"
                >
                  {savingCompany ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  保存公司信息
                </Button>
              </div>
            </form>
          </section>

          {/* Bank Accounts */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">银行账户</h2>
                <p className="text-sm text-muted-foreground ml-2">
                  报价单中将使用默认账户展示银行信息。
                </p>
              </div>
              <Button onClick={openAddBankForm} className="gap-2">
                <Plus className="h-4 w-4" />
                添加账户
              </Button>
            </div>

            {showBankForm && (
              <form
                onSubmit={handleSubmitBank}
                className="rounded-lg border bg-card p-4 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    {isEditingBank ? "编辑银行账户" : "添加银行账户"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowBankForm(false)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs">银行名称 *</Label>
                    <Input
                      placeholder="例如：Bank of China"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">账户名称 *</Label>
                    <Input
                      placeholder="账户持有人名称"
                      value={bankAccName}
                      onChange={(e) => setBankAccName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">账号 *</Label>
                    <Input
                      placeholder="银行账号"
                      value={bankAccNumber}
                      onChange={(e) => setBankAccNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">SWIFT 代码</Label>
                    <Input
                      placeholder="SWIFT/BIC"
                      value={bankSwift}
                      onChange={(e) => setBankSwift(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">银行地址</Label>
                    <Input
                      placeholder="银行地址"
                      value={bankAddress}
                      onChange={(e) => setBankAddress(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">备注</Label>
                    <Input
                      placeholder="备注信息"
                      value={bankNotes}
                      onChange={(e) => setBankNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={bankIsDefault}
                    onChange={(e) => setBankIsDefault(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <label htmlFor="isDefault" className="text-sm cursor-pointer">
                    设为默认账户
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowBankForm(false)}
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingBank}
                    className="gap-2"
                  >
                    {submittingBank ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isEditingBank ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {isEditingBank ? "保存" : "创建"}
                  </Button>
                </div>
              </form>
            )}

            <div className="rounded-lg border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>银行名称</TableHead>
                      <TableHead>账户名称</TableHead>
                      <TableHead>账号</TableHead>
                      <TableHead>SWIFT</TableHead>
                      <TableHead>银行地址</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="py-8 text-center text-muted-foreground"
                        >
                          暂无银行账户
                        </TableCell>
                      </TableRow>
                    ) : (
                      accounts.map((acc) => (
                        <TableRow key={acc.id}>
                          <TableCell>
                            {acc.isDefault && (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">
                            {acc.bankName}
                          </TableCell>
                          <TableCell>{acc.accountName}</TableCell>
                          <TableCell>{acc.accountNumber}</TableCell>
                          <TableCell>{acc.swiftCode || "-"}</TableCell>
                          <TableCell>{acc.bankAddress || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {!acc.isDefault && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleSetDefaultBank(acc.id)}
                                  title="设为默认"
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditBankForm(acc)}
                                title="编辑"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteBank(acc.id)}
                                title="删除"
                              >
                                <Trash2 className="h-4 w-4" />
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
          </section>
        </>
      )}
    </div>
  );
}
