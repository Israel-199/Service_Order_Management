import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import EmployeeForm from "@/components/forms/employee-form";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import type { Employee } from "@shared/schema";
import { toast } from "@/hooks/use-toast";

export default function Employees() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

const queryClient = useQueryClient();

const deleteMutation = useMutation({
  mutationFn: async (id: number) => {
    const res = await fetch(`/api/employees/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("Failed to delete employee");
    }
     // If no content, just return null or something
    if (res.status === 204) {
      return null;
    }
    return res.json();
  },
  onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Deleted successfully",
        description: "Employee was deleted.",
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error?.message || "Could not delete employee.",
        variant: "destructive",
      });
    },
});

  // Filter employees based on search
  const filteredEmployees = employees.filter(employee => 
    searchTerm === "" || 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.specialties?.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-techflow-primary">Employees</h2>
        </div>
        <div className="text-center py-8">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-techflow-primary">Employees</h2>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
            </DialogHeader>
            <EmployeeForm onSuccess={() => setIsCreateModalOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search employees..."
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
                <TableHead>Specialties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-techflow-secondary">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-muted">
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.phone || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {employee.specialties?.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        )) || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={employee.isActive ? "default" : "secondary"}
                        className={employee.isActive ? "bg-green-100 text-green-800" : ""}
                      >
                        {employee.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingEmployee(employee)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
  variant="ghost"
  size="sm"
  onClick={() => setDeleteEmployee(employee)}
>
    <Trash2 className="h-4 w-4 text-red-600" />
</Button>

<Dialog open={!!deleteEmployee} onOpenChange={() => setDeleteEmployee(null)}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete Employee</DialogTitle>
    </DialogHeader>
    <p>Are you sure you want to delete {deleteEmployee?.name}?</p>
    <div className="flex justify-end space-x-2 mt-4">
      <Button variant="secondary" onClick={() => setDeleteEmployee(null)}>Cancel</Button>
      <Button
        variant="destructive"
        onClick={() => {
          if (deleteEmployee) {
            deleteMutation.mutate(deleteEmployee.id);
            setDeleteEmployee(null);
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!editingEmployee} onOpenChange={() => setEditingEmployee(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          {editingEmployee && (
            <EmployeeForm 
              employee={editingEmployee}
              onSuccess={() => setEditingEmployee(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
