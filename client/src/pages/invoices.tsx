import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Invoice } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CreateInvoiceModal from "@/components/invoices/create-invoice-modal";
import EditInvoiceModal from "@/components/invoices/edit-invoice-modal";
import InvoicePreview from "@/components/invoices/invoice-preview";
import { format } from "date-fns";

function formatCents(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format((value || 0) / 100);
  } catch {
    return `ETB${((value || 0) / 100).toFixed(2)}`;
  }
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  void: "bg-red-100 text-red-800",
};

export default function Invoices() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/invoices/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Deleted", description: "Invoice deleted" });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Failed to delete invoice", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-techflow-primary">Invoices</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button onClick={() => setIsCreateOpen(true)} className="bg-primary hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> New Invoice
          </Button>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
            </DialogHeader>
            <CreateInvoiceModal onSuccess={() => setIsCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center py-8">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-8 text-techflow-secondary">No invoices found</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Service Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
                             <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted cursor-pointer" onClick={() => setPreviewInvoice(inv)}>
                    <TableCell className="font-medium text-primary">{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.serviceOrderId}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[inv.status] || statusColors.draft}>{inv.status.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{formatCents(inv.subtotalCents || 0, inv.currency || "ETB")}</TableCell>
                    <TableCell>{formatCents(inv.taxCents || 0, inv.currency || "ETB")}</TableCell>
                    <TableCell>{formatCents(inv.discountCents || 0, inv.currency || "ETB")}</TableCell>
                    <TableCell className="font-semibold">{formatCents(inv.totalCents || 0, inv.currency || "ETB")}</TableCell>
                    <TableCell>{inv.issuedAt ? format(new Date(inv.issuedAt as unknown as string), "yyyy-MM-dd") : "—"}</TableCell>
                    <TableCell>{inv.dueAt ? format(new Date(inv.dueAt as unknown as string), "yyyy-MM-dd") : "—"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" onClick={() => setEditingInvoice(inv)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => deleteMutation.mutate(inv.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={!!editingInvoice} onOpenChange={(open) => !open && setEditingInvoice(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          {editingInvoice && (
            <EditInvoiceModal invoice={editingInvoice} onSuccess={() => setEditingInvoice(null)} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewInvoice} onOpenChange={(open) => !open && setPreviewInvoice(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          {previewInvoice && (
            <InvoicePreview invoice={previewInvoice} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}