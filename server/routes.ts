import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCustomerSchema, insertEmployeeSchema, insertServiceOrderSchema, insertInvoiceSchema, updateServiceOrderSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import type { Request } from "express";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads
  const uploadsRoot = path.resolve(import.meta.dirname, "uploads");
  if (!fs.existsSync(uploadsRoot)) {
    fs.mkdirSync(uploadsRoot, { recursive: true });
  }
  const storageEngine = multer.diskStorage({
    destination: (_req: Request, _file: Express.Multer.File, cb: (error: any, destination: string) => void) => cb(null, uploadsRoot),
    filename: (_req: Request, file: Express.Multer.File, cb: (error: any, filename: string) => void) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, unique + "-" + safeName);
    },
  });
  const upload = multer({
    storage: storageEngine,
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  // Single and multi-file upload endpoint
  app.post("/api/uploads", upload.array("files", 10), async (req, res) => {
    try {
      const files = (req as any).files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }
      const result = files.map((f) => ({
        name: f.originalname,
        type: f.mimetype,
        url: `/uploads/${path.basename(f.path)}`,
        size: f.size,
      }));
      res.status(201).json({ files: result });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload files" });
    }
  });
  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, updateData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCustomer(id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/active", async (req, res) => {
    try {
      const employees = await storage.getActiveEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active employees" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, updateData);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEmployee(id);
      if (!deleted) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Service Order routes
  app.get("/api/service-orders", async (req, res) => {
    try {
      const { status, customerId, employeeId } = req.query;
      
      let orders;
      if (status && typeof status === 'string') {
        orders = await storage.getServiceOrdersByStatus(status);
      } else if (customerId && typeof customerId === 'string') {
        orders = await storage.getServiceOrdersByCustomer(parseInt(customerId));
      } else if (employeeId && typeof employeeId === 'string') {
        orders = await storage.getServiceOrdersByEmployee(parseInt(employeeId));
      } else {
        orders = await storage.getServiceOrders();
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service orders" });
    }
  });

  app.get("/api/service-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getServiceOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Service order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service order" });
    }
  });

  app.post("/api/service-orders", async (req, res) => {
    try {
      const orderData = insertServiceOrderSchema.parse(req.body);
      const order = await storage.createServiceOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service order" });
    }
  });
  app.put("/api/service-orders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid service order ID" });
    }

    // Allow partial updates without defaults
    const validatedData = updateServiceOrderSchema.parse(req.body);

    const updatedOrder = await storage.updateServiceOrder(id, {
      ...validatedData,
    });

    if (!updatedOrder) {
      return res.status(404).json({ error: "Service order not found" });
    }

    res.json(updatedOrder);
  } catch (err) {
    console.error("Error updating service order:", err);
    res.status(500).json({ error: "Failed to update service order" });
  }
});

  // app.put("/api/service-orders/:id", async (req, res) => {
  //   try {
  //     const id = parseInt(req.params.id);
  //     const updateData = insertServiceOrderSchema.partial().parse(req.body);
  //     const order = await storage.updateServiceOrder(id, updateData);
  //     if (!order) {
  //       return res.status(404).json({ message: "Service order not found" });
  //     }
  //     res.json(order);
  //   } catch (error) {
  //     if (error instanceof z.ZodError) {
  //       return res.status(400).json({ message: "Invalid data", errors: error.errors });
  //     }
  //     res.status(500).json({ message: "Failed to update service order" });
  //   }
  // });

  app.delete("/api/service-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteServiceOrder(id);
      if (!deleted) {
        return res.status(404).json({ message: "Service order not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service order" });
    }
  });

  // Invoices routes
  app.get("/api/invoices", async (_req, res) => {
    try {
      const all = await storage.getInvoices();
      res.json(all);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const invoice = await storage.getInvoice(id);
      if (!invoice) return res.status(404).json({ message: "Invoice not found" });
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.get("/api/service-orders/:id/invoices", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getServiceOrder(id);
      if (!order) return res.status(404).json({ message: "Service order not found" });
      const invoices = await storage.getInvoicesByServiceOrder(`#${order.orderId}`);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch service order invoices" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const data = insertInvoiceSchema.parse(req.body);
      const created = await storage.createInvoice(data);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  app.put("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertInvoiceSchema.partial().parse(req.body);
      const updated = await storage.updateInvoice(id, data);
      if (!updated) return res.status(404).json({ message: "Invoice not found" });
      res.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  app.delete("/api/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInvoice(id);
      if (!deleted) return res.status(404).json({ message: "Invoice not found" });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Customer order history
  app.get("/api/customers/:id/orders", async (req, res) => {
    try {
      const customerId = parseInt(req.params.id);
      const orders = await storage.getCustomerOrderHistory(customerId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer order history" });
    }
  });


// HTTPMethod	    Route	                    Functionality
// GET	     /api/inventory/items	            List all items
// GET	     /api/inventory/items/:id	        Get a specific item
// POST	   /api/inventory/items	            Create a new item
// PUT	     /api/inventory/items/:id	        Update an item
// DELETE   /api/inventory/items/:id	        Delete an item


// HTTPMethod	         Route	                     Functionality
// GET	         /api/inventory/transactions	     List all inventory transactions
//POST	     /api/inventory/transactions   Record a new transaction (IN, OUT, ADJUST) and automatically updates item quantity

  // // Inventory Items
app.get("/api/inventory/items", async (_req, res) => {
  try {
    const items = await storage.getInventoryItems();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inventory items" });
  }
});

app.get("/api/inventory/items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = await storage.getInventoryItem(id);
    if (!item) return res.status(404).json({ message: "Inventory item not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inventory item" });
  }
});

app.post("/api/inventory/items", async (req, res) => {
  try {
    const itemData = req.body; // Ideally, validate with Zod schema
    const item = await storage.createInventoryItem(itemData);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Failed to create inventory item" });
  }
});

app.put("/api/inventory/items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const updated = await storage.updateInventoryItem(id, data);
    if (!updated) return res.status(404).json({ message: "Inventory item not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update inventory item" });
  }
});

app.delete("/api/inventory/items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteInventoryItem(id);
    if (!deleted) return res.status(404).json({ message: "Inventory item not found" });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Failed to delete inventory item" });
  }
});

// Inventory Transactions
app.get("/api/inventory/transactions", async (_req, res) => {
  try {
    const transactions = await storage.getInventoryTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch inventory transactions" });
  }
});

app.post("/api/inventory/transactions", async (req, res) => {
  try {
    const data = req.body; // Validate with Zod schema if possible
    const transaction = await storage.createInventoryTransaction(data);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Failed to create inventory transaction" });
  }
});


  const httpServer = createServer(app);
  return httpServer;
}
