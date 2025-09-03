import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Eye, Trash2, Paperclip, RefreshCw } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EditOrderModal from "./edit-order-modal";
import type { ServiceOrderWithDetails } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function AttachmentPreview({ order }: { order: ServiceOrderWithDetails }) {
  const attachments = order.attachments || [];
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-muted-foreground">Order</div>
        <div className="text-lg font-semibold">#{order.orderId} • {order.customer.name}</div>
        <div className="text-sm text-muted-foreground">{order.serviceType}</div>
        {order.description && (
          <div className="mt-2">
            <div className="text-sm font-medium text-techflow-primary">Description</div>
            <p className="text-sm whitespace-pre-wrap text-foreground/90">{order.description}</p>
          </div>
        )}
      </div>
      {attachments.length === 0 ? (
        <div className="text-sm text-muted-foreground">No attachments</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attachments.map((att, idx) => (
            <div key={idx} className="border rounded-md p-3">
              <div className="font-medium break-all">{att.name}</div>
              <div className="text-xs text-muted-foreground">{att.type}</div>
              {att.type.startsWith("image/") && (
                <img src={att.url} alt={att.name} className="mt-2 max-h-48 object-contain rounded" />
              )}
              {att.type.startsWith("audio/") && (
                <audio controls className="mt-2 w-full">
                  <source src={att.url} type={att.type} />
                </audio>
              )}
              {!att.type.startsWith("image/") && !att.type.startsWith("audio/") && (
                <a href={att.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-primary underline">Open</a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface OrderTableProps {
  orders: ServiceOrderWithDetails[];
  showPagination?: boolean;
}

const statusColors = {
  new: "bg-gray-100 text-gray-800",
  assigned: "bg-blue-100 text-blue-800", 
  in_progress: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  closed: "bg-gray-600 text-white",
};

const priorityColors = {
  normal: "bg-green-100 text-green-800",
  urgent: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusDisplayNames = {
  new: "New",
  assigned: "Assigned",
  in_progress: "In Progress", 
  completed: "Completed",
  closed: "Closed",
};

export default function OrderTable({ orders, showPagination = false }: OrderTableProps) {
  const { toast } = useToast();
  const [editingOrder, setEditingOrder] = useState<ServiceOrderWithDetails | null>(null);
  const [previewOrder, setPreviewOrder] = useState<ServiceOrderWithDetails | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/service-orders/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/service-orders/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to delete order",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleDeleteOrder = (orderId: number) => {
    deleteOrderMutation.mutate(orderId);
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-techflow-secondary">
        No service orders found
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Attachments</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted">
                <TableCell className="font-medium text-primary">
                  #{order.orderId}
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium text-techflow-primary">
                      {order.customer.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.customer.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{order.serviceType}</TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-32">
                      <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                        {statusDisplayNames[order.status as keyof typeof statusDisplayNames]}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge className={priorityColors[order.priority as keyof typeof priorityColors]}>
                    {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span>{order.employee?.name || "Unassigned"}</span>
                    {order.isRecurring === 1 && (
                      <Badge variant="outline" className="text-xs">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {order.recurringFrequency}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {order.attachments?.length || 0}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setEditingOrder(order)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPreviewOrder(order)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Service Order</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete order #{order.orderId}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {showPagination && (
        <div className="px-6 py-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-techflow-secondary">
              Showing 1 to {Math.min(10, orders.length)} of {orders.length} results
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-white">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <EditOrderModal 
        open={!!editingOrder}
        onOpenChange={(open) => !open && setEditingOrder(null)}
        order={editingOrder}
      />
      <Dialog open={!!previewOrder} onOpenChange={(open) => !open && setPreviewOrder(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Service Order Preview</DialogTitle>
          </DialogHeader>
          {previewOrder && <AttachmentPreview order={previewOrder} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
