import { useMemo, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertInvoiceSchema, type InsertInvoice, type ServiceOrderWithDetails } from "@shared/schema";

function formatCents(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format((value || 0) / 100);
  } catch {
    return `ETB${((value || 0) / 100).toFixed(2)}`;
  }
}

export default function CreateInvoiceModal({ onSuccess }: { onSuccess: () => void }) {
  const { toast } = useToast();

  const { data: serviceOrders = [] } = useQuery<ServiceOrderWithDetails[]>({
    queryKey: ["/api/service-orders"],
  });

  const form = useForm<InsertInvoice>({
    resolver: zodResolver(insertInvoiceSchema),
    defaultValues: {
      serviceOrderId: "",
      items: [],
      taxCents: 0,
      discountCents: 0,
      currency: "ETB",
      status: "draft",
      notes: "",
      issuedAt: undefined,
      dueAt: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });

  const [taxPercent, setTaxPercent] = useState<number>(15);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  const subtotalCents = useMemo(() => {
    const items = form.getValues("items") ?? [];
    return items.reduce((sum, it) => sum + (Number(it.quantity || 0) * Number(it.unitPriceCents || 0)), 0);
  }, [form.watch("items")] );

  const discountCentsComputed = useMemo(() => {
    return Math.round(subtotalCents * (Number(discountPercent) / 100));
  }, [subtotalCents, discountPercent]);

  const taxCentsComputed = useMemo(() => {
    const taxableBase = Math.max(0, subtotalCents - discountCentsComputed);
    return Math.round(taxableBase * (Number(taxPercent) / 100));
  }, [subtotalCents, discountCentsComputed, taxPercent]);

  useEffect(() => {
    form.setValue("discountCents", discountCentsComputed);
    form.setValue("taxCents", taxCentsComputed);
  }, [discountCentsComputed, taxCentsComputed]);

  const totalCents = useMemo(() => {
    return subtotalCents + taxCentsComputed - discountCentsComputed;
  }, [subtotalCents, taxCentsComputed, discountCentsComputed]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertInvoice) => {
      const res = await apiRequest("POST", "/api/invoices", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({ title: "Created", description: "Invoice created successfully" });
      form.reset();
      onSuccess();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err?.message || "Failed to create invoice", variant: "destructive" });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((values) => createMutation.mutate(values))} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="serviceOrderId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Order</FormLabel>
                <Select value={String(field.value)} onValueChange={(v) => field.onChange(v)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service order" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {serviceOrders.map((o) => {
                      const display = o.orderId ? `#${o.orderId} - ${o.customer.name}` : `#ORD-${new Date().getFullYear()}-${String(o.id).padStart(3, "0")}`;
                      const value = o.orderId ? `#${o.orderId}` : `#ORD-${new Date().getFullYear()}-${String(o.id).padStart(3, "0")}`;
                      return (
                        <SelectItem key={o.id} value={value}>
                          {display}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="void">Void</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Input placeholder="e.g. ETB" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>VAT (%)</FormLabel>
            <Input type="number" min={0} step={0.01} value={taxPercent} onChange={(e) => setTaxPercent(Number(e.target.value))} />
            <FormMessage />
          </FormItem>

          <FormItem>
            <FormLabel>Discount (%)</FormLabel>
            <Input type="number" min={0} step={0.01} value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} />
            <FormMessage />
          </FormItem>

          <FormField
            control={form.control}
            name="issuedAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Issued At</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className="justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(new Date(field.value as unknown as string), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value as unknown as string) : undefined}
                      onSelect={(date) => field.onChange(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueAt"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due At</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant={"outline"} className="justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(new Date(field.value as unknown as string), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value as unknown as string) : undefined}
                      onSelect={(date) => field.onChange(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-techflow-primary">Line Items</h4>
            <Button type="button" variant="secondary" onClick={() => append({ description: "", quantity: 1, unitPriceCents: 0 })}>
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                <div className="md:col-span-5">
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <Input placeholder="Item description" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qty</FormLabel>
                        <Input type="number" min={1} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPriceCents`}
                    render={({ field }) => (
                      <FormItem>
                                        <FormLabel>Unit Price (ETB)</FormLabel>
                <Input type="number" min={0} step={0.01} value={Number(field.value ?? 0) / 100} onChange={(e) => field.onChange(Math.round(Number(e.target.value || "0") * 100))} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-2 flex items-center gap-2">
                  <Button type="button" variant="ghost" className="text-red-600" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <Textarea placeholder="Additional notes" {...field} value={field.value ?? ""} />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="text-sm text-techflow-secondary">
            Subtotal: <span className="font-medium text-techflow-primary">{formatCents(subtotalCents, form.getValues("currency") || "")}</span>
            {" "} | Tax: <span className="font-medium text-techflow-primary">{formatCents(Number(form.watch("taxCents") || 0), form.getValues("currency") || "ETB")}</span>
            {" "} | Discount: <span className="font-medium text-techflow-primary">{formatCents(Number(form.watch("discountCents") || 0), form.getValues("currency") || "ETB")}</span>
          </div>
          <div className="text-lg font-semibold text-techflow-primary">
            Total: {formatCents(totalCents, form.getValues("currency") || "ETB")}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" className="bg-primary hover:bg-blue-700" disabled={createMutation.isPending}>
             
            {createMutation.isPending ? "Creating..." : "Create Invoice"}
          </Button>
        </div>
      </form>
    </Form>
  );
}