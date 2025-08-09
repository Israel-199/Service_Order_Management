// controllers/customerController.js
const Customer = require('../models/customer');

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll();
    res.json({ message: "Customers fetched successfully", customers });
  } catch (err) {
    res.status(500).json({ error: "Server error", message: err.message });
  }
};

exports.getCustomerById = async (req, res) => {
  const { customer_id } = req.params;
  const customer = await Customer.findByPk(customer_id);
  if (!customer) {
    return res.status(404).json({ error: "Not Found", message: "customer not found" });
  }
  res.json({ message: "Customer details retrieved", customer });
};

exports.createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ message: "Customer created successfully", customer_id: customer.customer_id });
  } catch (err) {
    res.status(400).json({ error: "Bad request", message: err.message });
  }
};

exports.updateCustomer = async (req, res) => {
  const { customer_id } = req.params;
  const customer = await Customer.findByPk(customer_id);
  if (!customer) {
    return res.status(404).json({ error: "Not Found", message: "customer not found" });
  }

  await customer.update(req.body);
  res.json({ message: "Customer updated successfully" });
};

exports.deleteCustomer = async (req, res) => {
  const { customer_id } = req.params;
  const customer = await Customer.findByPk(customer_id);
  if (!customer) {
    return res.status(404).json({ error: "Not Found", message: "customer not found" });
  }

  await customer.destroy();
  res.json({ message: "Customer deleted successfully" });
};