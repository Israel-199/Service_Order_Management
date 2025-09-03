import { useMemo } from "react";
import type { Invoice } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, HeadingLevel, TextRun } from "docx";

function formatCents(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format((value || 0) / 100);
  } catch {
    return `ETB${((value || 0) / 100).toFixed(2)}`;
  }
}

export default function InvoicePreview({ invoice }: { invoice: Invoice }) {
  const isNumericId = typeof invoice.serviceOrderId === "number" || /^\d+$/.test(String(invoice.serviceOrderId));
  const { data: serviceOrder } = useQuery<any>({
    queryKey: ["/api/service-orders", String(invoice.serviceOrderId)],
    enabled: isNumericId,
  });

  const items = (invoice.items as any[]) || [];
  const subtotalCents = useMemo(() => items.reduce((sum, it) => sum + (Number(it.quantity || 0) * Number(it.unitPriceCents || 0)), 0), [items]);

  const exportPdf = () => {
    const doc = new jsPDF();
    const currency = invoice.currency || "ETB";

    doc.setFontSize(16);
    doc.text(`Invoice ${invoice.invoiceNumber}`, 14, 18);
    if (serviceOrder) {
      doc.setFontSize(11);
      doc.text(`Customer: ${serviceOrder.customer?.name ?? "#"}${serviceOrder.customer ? "" : serviceOrder?.id ?? ""}`, 14, 26);
    }
    doc.setFontSize(11);
    doc.text(`Issued: ${invoice.issuedAt ? new Date(invoice.issuedAt as unknown as string).toLocaleDateString() : "—"}`, 14, 34);
    doc.text(`Due: ${invoice.dueAt ? new Date(invoice.dueAt as unknown as string).toLocaleDateString() : "—"}`, 80, 34);

    autoTable(doc, {
      startY: 40,
      head: [["Description", "Qty", `Unit (${currency})`, `Line Total (${currency})`]],
      body: items.map((it) => [
        it.description,
        String(it.quantity),
        (Number(it.unitPriceCents || 0) / 100).toFixed(2),
        ((Number(it.unitPriceCents || 0) * Number(it.quantity || 0)) / 100).toFixed(2),
      ]),
    });

    const finalY = (doc as any).lastAutoTable.finalY || 40;

    doc.text(`Subtotal: ${formatCents(invoice.subtotalCents || subtotalCents, currency)}`, 14, finalY + 10);
    doc.text(`Discount: ${formatCents(invoice.discountCents || 0, currency)}`, 14, finalY + 18);
    doc.text(`VAT: ${formatCents(invoice.taxCents || 0, currency)}`, 14, finalY + 26);
    doc.setFontSize(13);
    doc.text(`Total: ${formatCents(invoice.totalCents || 0, currency)}`, 14, finalY + 36);

    doc.save(`${invoice.invoiceNumber}.pdf`);
  };

  const exportDocx = async () => {
    const currency = invoice.currency || "ETB";
    const tableRows: TableRow[] = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Description", heading: HeadingLevel.HEADING_3 })] }),
          new TableCell({ children: [new Paragraph({ text: "Qty" })] }),
          new TableCell({ children: [new Paragraph({ text: `Unit (${currency})` })] }),
          new TableCell({ children: [new Paragraph({ text: `Line Total (${currency})` })] }),
        ],
      }),
      ...items.map((it) => new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(String(it.description))] }),
          new TableCell({ children: [new Paragraph(String(it.quantity))] }),
          new TableCell({ children: [new Paragraph((Number(it.unitPriceCents || 0) / 100).toFixed(2))] }),
          new TableCell({ children: [new Paragraph(((Number(it.unitPriceCents || 0) * Number(it.quantity || 0)) / 100).toFixed(2))] }),
        ],
      }))
    ];

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({ text: `Invoice ${invoice.invoiceNumber}`, heading: HeadingLevel.TITLE }),
            new Paragraph({ text: serviceOrder?.customer ? `Customer: ${serviceOrder.customer.name}` : `Service Order ${invoice.serviceOrderId}` }),
            new Paragraph({ text: `Issued: ${invoice.issuedAt ? new Date(invoice.issuedAt as unknown as string).toLocaleDateString() : "—"}` }),
            new Paragraph({ text: `Due: ${invoice.dueAt ? new Date(invoice.dueAt as unknown as string).toLocaleDateString() : "—"}` }),
            new Paragraph({ text: " " }),
            new Table({ rows: tableRows }),
            new Paragraph({ text: " " }),
            new Paragraph({ text: `Subtotal: ${formatCents(invoice.subtotalCents || subtotalCents, currency)}` }),
            new Paragraph({ text: `Discount: ${formatCents(invoice.discountCents || 0, currency)}` }),
            new Paragraph({ text: `VAT: ${formatCents(invoice.taxCents || 0, currency)}` }),
            new Paragraph({ text: `Total: ${formatCents(invoice.totalCents || 0, currency)}`, heading: HeadingLevel.HEADING_3 }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${invoice.invoiceNumber}.docx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Invoice {invoice.invoiceNumber}</div>
          <div className="text-sm text-muted-foreground">Service Order {invoice.serviceOrderId} {serviceOrder?.customer ? `• ${serviceOrder.customer.name}` : ""}</div>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportPdf}>Export PDF</Button>
          <Button variant="secondary" onClick={exportDocx}>Export DOCX</Button>
        </div>
      </div>

      <div className="text-sm">
        <div>Issued: {invoice.issuedAt ? new Date(invoice.issuedAt as unknown as string).toLocaleDateString() : "—"}</div>
        <div>Due: {invoice.dueAt ? new Date(invoice.dueAt as unknown as string).toLocaleDateString() : "—"}</div>
        {invoice.notes && <div className="mt-2">Notes: {invoice.notes}</div>}
      </div>

      <div className="border rounded-md">
        <div className="grid grid-cols-12 gap-2 p-2 font-semibold bg-gray-50">
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-right">Qty</div>
          <div className="col-span-2 text-right">Unit ({invoice.currency || "ETB"})</div>
          <div className="col-span-2 text-right">Line Total</div>
        </div>
        {items.map((it, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 p-2 border-t">
            <div className="col-span-6">{it.description}</div>
            <div className="col-span-2 text-right">{it.quantity}</div>
            <div className="col-span-2 text-right">{formatCents(Number(it.unitPriceCents || 0), invoice.currency || "ETB")}</div>
            <div className="col-span-2 text-right">{formatCents(Number(it.unitPriceCents || 0) * Number(it.quantity || 0), invoice.currency || "ETB")}</div>
          </div>
        ))}
        <div className="p-2 border-t text-right space-y-1">
          <div>Subtotal: <span className="font-medium">{formatCents(invoice.subtotalCents || subtotalCents, invoice.currency || "ETB")}</span></div>
          <div>Discount: <span className="font-medium">{formatCents(invoice.discountCents || 0, invoice.currency || "ETB")}</span></div>
          <div>VAT: <span className="font-medium">{formatCents(invoice.taxCents || 0, invoice.currency || "ETB")}</span></div>
          <div className="text-lg">Total: <span className="font-semibold">{formatCents(invoice.totalCents || 0, invoice.currency || "ETB")}</span></div>
        </div>
      </div>
    </div>
  );
}