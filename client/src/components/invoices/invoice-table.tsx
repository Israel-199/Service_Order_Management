import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Invoice } from "@shared/schema";
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

export default function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Service Order</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Issued</TableHead>
            <TableHead>Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow key={inv.id}  className="hover:bg-muted">
              <TableCell className="font-medium text-primary">{inv.invoiceNumber}</TableCell>
              <TableCell>{inv.serviceOrderId}</TableCell>
              <TableCell>
                <Badge className={statusColors[inv.status] || statusColors.draft}>{inv.status.toUpperCase()}</Badge>
              </TableCell>
                             <TableCell className="font-semibold">{formatCents(inv.totalCents || 0, inv.currency || "ETB")}</TableCell>
              <TableCell>{inv.issuedAt ? format(new Date(inv.issuedAt as unknown as string), "yyyy-MM-dd") : "—"}</TableCell>
              <TableCell>{inv.dueAt ? format(new Date(inv.dueAt as unknown as string), "yyyy-MM-dd") : "—"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}