import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertServiceOrderSchema, type InsertServiceOrder, type Customer, type Employee, type ServiceOrderWithDetails } from "@shared/schema";

interface EditOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ServiceOrderWithDetails | null;
}

const serviceTypes = [
  "Website Development",
  "Mobile App Development", 
  "Hardware Repair",
  "Network Setup",
  "System Maintenance",
  "Software Installation",
  "Database Management",
  "Cloud Migration"
];

export default function EditOrderModal({ open, onOpenChange, order }: EditOrderModalProps) {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<{name: string; type: string; url: string}[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringEndDate, setRecurringEndDate] = useState<Date>();
  const [showCustomFrequency, setShowCustomFrequency] = useState(false);
  const [customFrequencyValue, setCustomFrequencyValue] = useState<number>(1);
  const [customFrequencyUnit, setCustomFrequencyUnit] = useState<string>("days");

  const form = useForm<InsertServiceOrder>({
    resolver: zodResolver(insertServiceOrderSchema),
    defaultValues: {
      customerId: 0,
      serviceType: "",
      description: "",
      status: "new",
      priority: "normal",
      attachments: [],
      isRecurring: 0,
      recurringFrequency: undefined,
      recurringEndDate: undefined,
    },
  });

  // Load order data when modal opens
  useEffect(() => {
    if (order && open) {
      form.reset({
        customerId: order.customerId,
        employeeId: order.employeeId || undefined,
        serviceType: order.serviceType,
        description: order.description,
        status: order.status as any,
        priority: order.priority as any,
        isRecurring: order.isRecurring,
        recurringFrequency: order.recurringFrequency as any,
        recurringEndDate: order.recurringEndDate ? new Date(order.recurringEndDate) : undefined,
      });
      
      setAttachments(order.attachments || []);
      setIsRecurring(order.isRecurring === 1);
      setRecurringEndDate(order.recurringEndDate ? new Date(order.recurringEndDate) : undefined);
      setShowCustomFrequency(order.recurringFrequency === "custom");
      setCustomFrequencyValue(order.customFrequencyValue || 1);
      setCustomFrequencyUnit(order.customFrequencyUnit || "days");
    }
  }, [order, open, form]);

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees/active"],
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (data: InsertServiceOrder) => {
      if (!order) throw new Error("No order to update");
      const response = await apiRequest("PUT", `/api/service-orders/${order.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/service-orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Success",
        description: "Service order updated successfully",
      });
      onOpenChange(false);
      form.reset();
      setAttachments([]);
      setIsRecurring(false);
      setRecurringEndDate(undefined);
      setShowCustomFrequency(false);
      setCustomFrequencyValue(1);
      setCustomFrequencyUnit("days");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update service order",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments = Array.from(files).map(file => ({
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file)
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceRecording = (audioBlob: Blob, fileName: string) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const voiceAttachment = {
      name: fileName,
      type: 'audio/webm',
      url: audioUrl
    };
    setAttachments(prev => [...prev, voiceAttachment]);
  };

  const onSubmit = (data: InsertServiceOrder) => {
    const submitData = {
      ...data,
      attachments,
      isRecurring: isRecurring ? 1 : 0,
      recurringEndDate: isRecurring ? recurringEndDate : undefined,
      customFrequencyValue: showCustomFrequency ? customFrequencyValue : undefined,
      customFrequencyUnit: showCustomFrequency ? customFrequencyUnit : undefined,
    };
    updateOrderMutation.mutate(submitData);
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Service Order #{order.orderId}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Selection */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name} - {customer.company || customer.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Service Type */}
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {serviceTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the service requirements..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Employee Assignment */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Employee (Optional)</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(value === "unassigned" ? undefined : parseInt(value))}
                    value={field.value?.toString() || "unassigned"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Attachments */}
            <div>
              <FormLabel>Attachments</FormLabel>
              <div className="space-y-2">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, Images, Documents, Audio files up to 10MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept=".pdf,.png,.jpg,.jpeg,.docx,.mp3,.wav,.m4a,.ogg"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                
                <div className="flex justify-center">
                  <VoiceRecorder onRecordingComplete={handleVoiceRecording} />
                </div>
                
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((attachment, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {attachment.name}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeAttachment(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recurring Order Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="recurring" 
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                />
                <FormLabel htmlFor="recurring">Make this a recurring order</FormLabel>
              </div>
              
              {isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                  <FormField
                    control={form.control}
                    name="recurringFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select onValueChange={(value) => {
                          field.onChange(value);
                          setShowCustomFrequency(value === "custom");
                        }} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !recurringEndDate && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {recurringEndDate ? format(recurringEndDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={recurringEndDate}
                          onSelect={setRecurringEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {showCustomFrequency && (
                    <div className="col-span-2 space-y-2">
                      <FormLabel>Custom Frequency</FormLabel>
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          value={customFrequencyValue}
                          onChange={(e) => setCustomFrequencyValue(parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                        <Select value={customFrequencyUnit} onValueChange={setCustomFrequencyUnit}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="weeks">Weeks</SelectItem>
                            <SelectItem value="months">Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-gray-500">
                        Example: Every {customFrequencyValue} {customFrequencyUnit}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateOrderMutation.isPending}
                className="bg-primary hover:bg-blue-700"
              >
                {updateOrderMutation.isPending ? "Updating..." : "Update Order"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}