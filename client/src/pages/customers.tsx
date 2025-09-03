import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CustomerForm from "@/components/forms/customer-form";
import { Plus, Search, Edit, Trash2, ChevronDown, ChevronRight, Eye } from "lucide-react";
import type { Customer, ServiceOrderWithDetails } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export default function Customers() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteCustomer, setDeleteCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCustomer, setExpandedCustomer] = useState<number | null>(null);

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: customerOrders = [], isLoading: ordersLoading } = useQuery<ServiceOrderWithDetails[]>({
    queryKey: [`/api/customers/${expandedCustomer}/orders`],
    enabled: expandedCustomer !== null,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete customer");
      }
       // If no content, just return null or something
    if (res.status === 204) {
      return null;
    }
      return res.json();
    },
   onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Deleted successfully",
        description: "Customer was deleted.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error?.message || "Could not delete customer.",
        variant: "destructive",
      });
    },
   
  });

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => 
    searchTerm === "" || 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExpandCustomer = (customerId: number) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: "bg-gray-100 text-gray-800",
      assigned: "bg-blue-100 text-blue-800",
      in_progress: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      closed: "bg-gray-600 text-white",
    };
    return colors[status as keyof typeof colors] || colors.new;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-techflow-primary">Customers</h2>
        </div>
        <div className="text-center py-8">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-techflow-primary">Customers</h2>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <CustomerForm onSuccess={() => setIsCreateModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Order History</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-techflow-secondary">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <>
                    <TableRow key={customer.id} className="hover:bg-muted">
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || "—"}</TableCell>
                      <TableCell>{customer.company || "—"}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExpandCustomer(customer.id)}
                          className="flex items-center space-x-2"
                        >
                          {expandedCustomer === customer.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <Eye className="h-4 w-4" />
                          <span>View Orders</span>
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingCustomer(customer)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                           <Button
  variant="ghost"
  size="sm"
  onClick={() => setDeleteCustomer(customer)}
>
    <Trash2 className="h-4 w-4 text-red-600" />
</Button>

<Dialog open={!!deleteCustomer} onOpenChange={() => setDeleteCustomer(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Customer</DialogTitle>
    </DialogHeader>
    <p>Are you sure you want to delete {deleteCustomer?.name}?</p>
    <div className="flex justify-end space-x-2 mt-4">
      <Button variant="secondary" onClick={() => setDeleteCustomer(null)}>Cancel</Button>
      <Button
        variant="destructive"
        onClick={() => {
          if (deleteCustomer) {
            deleteMutation.mutate(deleteCustomer.id);
            setDeleteCustomer(null);
          }
        }}
      >
        Delete
      </Button>
    </div>
  </DialogContent>
</Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                    {expandedCustomer === customer.id && (
                      <TableRow>
                        <TableCell colSpan={6} className="bg-gray-50 p-4 dark:bg-gray-900 dark:text-white">
                          <div className="space-y-3">
                            <h4 className="font-medium text-techflow-primary">Order History</h4>
                            {ordersLoading ? (
                              <div className="text-center py-4">Loading orders...</div>
                            ) : customerOrders.length === 0 ? (
                              <div className="text-center py-4 text-techflow-secondary">No orders found</div>
                            ) : (
                              <div className="space-y-2">
                                {customerOrders.map((order) => (
                                  <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-lg border  dark:bg-black dark:text-white">
                                    <div className="flex items-center space-x-3">
                                      <span className="font-medium text-primary">#{order.orderId}</span>
                                      <span className="text-sm">{order.serviceType}</span>
                                      <Badge className={getStatusColor(order.status)}>
                                        {order.status.replace('_', ' ')}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-techflow-secondary">
                                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "No date available"}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <CustomerForm 
              customer={editingCustomer}
              onSuccess={() => setEditingCustomer(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
