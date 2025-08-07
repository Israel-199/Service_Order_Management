const { Customer, ServiceOrder, ServiceType, Sequelize } = require('../models');
const { parsePagination } = require('../utils/pagination');
const { buildSearchCondition, buildSearchConditionWithFields, buildSearchConditionWithSequelize } = require('../utils/search');
const { Op } = Sequelize;

class CustomerService {
  /**
   * Fetch paginated/sorted/searched customers.
   * Query params supported:
   *  - page, limit, sortBy, sortOrder
   *  - search (free-text search)
   */
  async getAllCustomers(query) {
    const {
      limit,
      offset,
      sortBy,
      sortOrder,
      page,
    } = parsePagination(query);

    const search = query.search || query.q || null;

    const whereClause = search
      ? buildSearchCondition(['name', 'email', 'company', 'phone'], search)
      : {};

    const { rows: customers, count: total } = await Customer.findAndCountAll({
      where: whereClause,
      attributes: [
        ['customer_id', 'id'],
        'name',
        'email',
        'phone',
        'company',
        'created_at',
      ],
      include: [
        {
          model: ServiceOrder,
          attributes: [['order_id', 'orderId'], 'status', 'created_at'],
          include: [
            {
              model: ServiceType,
              attributes: ['name'],
            },
          ],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    // Format the response to include service orders with serviceType
    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      createdAt: customer.created_at,
      serviceOrders: customer.ServiceOrders.map(order => ({
        orderId: order.orderId,
        serviceType: order.ServiceType ? order.ServiceType.name : null,
        status: order.status,
        createdAt: order.created_at,
      })),
    }));

    return {
      customers: formattedCustomers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }


// Query params supported:
//  - id (customer_id), page, limit, sortBy, sortOrder
// Example usage: 
// GET /customers/1
  async getCustomerById(id) {
    return await Customer.findByPk(id, {
      attributes: [
        ['customer_id', 'id'],
        'name',
        'email',
        'phone',
        'company',
        'address',
        'tin_number',
        'created_at',
      ],
    });
  }


// Expects customer data in request body
// Body: { "name": "John Doe", "email": " ", "phone": "1234567890", "company": "ABC Corp", "address": "123 Main St", "tin_number": "123456789" }
// Example usage: 
// POST /customers
// POST /customers? name, email, phone, company, address, tin_number
  async createCustomer(data) {
    return await Customer.create(data);
  }


// Body: { "name": "John Doe", "email": " ", "phone": "1234567890", "company": "ABC Corp", "address": "123 Main St", "tin_number": "123456789" }
// Example usage: 
// PUT /customers/1
// PUT /customers/1? name, email, phone, company, address, tin_number  
  async updateCustomer(id, data) {
    const customer = await Customer.findByPk(id);
    if (!customer) throw new Error('Customer not found');
    return await customer.update(data);
  }


// Returns a success message on deletion
// Throws an error if customer not found
// Example usage: 
// DELETE /customers/1  
  async deleteCustomer(id) {
    const customer = await Customer.findByPk(id);
    if (!customer) throw new Error('Customer not found');
    await customer.destroy();
    return { message: 'Customer deleted successfully' };
  }


// Fetch customers by name.
// Query params supported:
//  - page, limit, sortBy, sortOrder
// Returns a paginated list of customers matching the name
// Example usage:
// GET /customers/name/:name? page, limit, sort_by, order
// Returns a paginated list of customers matching the name
  async getCustomersByName(name, query) {
    const {
      limit,
      offset,
      sortBy = 'customer_id',
      sortOrder = 'ASC',
      page,
    } = parsePagination(query);

    const whereClause = { name: { [Op.like]: `%${name}%` } };

    const { rows: customers, count: total } = await Customer.findAndCountAll({
      where: whereClause,
      attributes: [
        ['customer_id', 'id'],
        'name',
        'email',
        'phone',
        'company',
        'address',
        'tin_number',
        'created_at',
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Fetch customers by email.
   * Query params supported:
   *  - page, limit, sortBy, sortOrder
   */
  async getCustomersByEmail(email, query) {
    const {
      limit,
      offset,
      sortBy = 'customer_id',
      sortOrder = 'ASC',
      page,
    } = parsePagination(query);

    const whereClause = { email: { [Op.like]: `%${email}%` } };

    const { rows: customers, count: total } = await Customer.findAndCountAll({
      where: whereClause,
      attributes: [
        ['customer_id', 'id'],
        'name',
        'email',
        'phone',
        'company',
        'address',
        'tin_number',
        'created_at',
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Fetch customers by phone.
   * Query params supported:
   *  - page, limit, sortBy, sortOrder
   */
  async getCustomersByPhone(phone, query) {
    const {
      limit,
      offset,
      sortBy = 'customer_id',
      sortOrder = 'ASC',
      page,
    } = parsePagination(query);

    const whereClause = { phone: { [Op.like]: `%${phone}%` } };

    const { rows: customers, count: total } = await Customer.findAndCountAll({
      where: whereClause,
      attributes: [
        ['customer_id', 'id'],
        'name',
        'email',
        'phone',
        'company',
        'address',
        'tin_number',
        'created_at',
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  /**
   * Fetch customers by company.
   * Query params supported:
   *  - page, limit, sortBy, sortOrder
   */
  async getCustomersByCompany(company, query) {
    const {
      limit,
      offset,
      sortBy = 'customer_id',
      sortOrder = 'ASC',
      page,
    } = parsePagination(query);

    const whereClause = { company: { [Op.like]: `%${company}%` } };

    const { rows: customers, count: total } = await Customer.findAndCountAll({
      where: whereClause,
      attributes: [
        ['customer_id', 'id'],
        'name',
        'email',
        'phone',
        'company',
        'address',
        'tin_number',
        'created_at',
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Fetch customers by address.
   * Query params supported:
   *  - page, limit, sortBy, sortOrder
   */
  async getCustomersByAddress(address, query) {
    const {
      limit,
      offset,
      sortBy = 'customer_id',
      sortOrder = 'ASC',
      page,
    } = parsePagination(query);

    const whereClause = { address: { [Op.like]: `%${address}%` } };

    const { rows: customers, count: total } = await Customer.findAndCountAll({
      where: whereClause,
      attributes: [
        ['customer_id', 'id'],
        'name',
        'email',
        'phone',
        'company',
        'address',
        'tin_number',
        'created_at',
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
    });

    return {
      customers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }


  async getCustomerOrders(customerId) {
    // Validate customerId
    const id = parseInt(customerId, 10);
    if (isNaN(id)) {
      throw new Error('Invalid customer ID');
    }

    // Check if customer exists
    const customer = await Customer.findByPk(id);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Fetch service orders with related service types
    const serviceOrders = await ServiceOrder.findAll({
      where: { customer_id: id },
      include: [
        {
          model: ServiceType,
          attributes: ['name'], // For orderServiceType
        },
      ],
      attributes: ['order_id', 'status'], // For orderId, orderStatus
    });

    // Format data
    return serviceOrders.map(order => ({
      orderId: order.order_id,
      orderServiceType: order.ServiceType ? order.ServiceType.name : null,
      orderStatus: order.status,
    }));
  }
}
// Exporting the CustomerService instance
module.exports = new CustomerService();


//// == additionals
//   /**
//    * Fetch customers by TIN number.
//    * Query params supported:
//    *  - page, limit, sortBy, sortOrder
//    */
//   async getCustomersByTinNumber(tinNumber, query) {
//     const {
//       limit,
//       offset,
//       sortBy = 'customer_id',
//       sortOrder = 'ASC',
//       page,
//     } = parsePagination(query);

//     const whereClause = { tin_number: { [Op.like]: `%${tinNumber}%` } };

//     const { rows: customers, count: total } = await Customer.findAndCountAll({
//       where: whereClause,
//       attributes: [
//         ['customer_id', 'id'],
//         'name',
//         'email',
//         'phone',
//         'company',
//         'address',
//         'tin_number',
//         'created_at',
//       ],
//       order: [[sortBy, sortOrder]],
//       limit,
//       offset,
//     });

//     return {
//       customers,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

//   /**
//    * Fetch customers by creation date.
//    * Query params supported:
//    *  - page, limit, sortBy, sortOrder
//    */
//   async getCustomersByCreatedAt(createdAt, query) {
//     const {
//       limit,
//       offset,
//       sortBy = 'customer_id',
//       sortOrder = 'ASC',
//       page,
//     } = parsePagination(query);

//     const whereClause = { created_at: { [Op.like]: `%${createdAt}%` } };

//     const { rows: customers, count: total } = await Customer.findAndCountAll({
//       where: whereClause,
//       attributes: [
//         ['customer_id', 'id'],
//         'name',
//         'email',
//         'phone',
//         'company',
//         'address',
//         'tin_number',
//         'created_at',
//       ],
//       order: [[sortBy, sortOrder]],
//       limit,
//       offset,
//     });

//     return {
//       customers,
//       pagination: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

//   async getCustomerByServiceOrderId(serviceOrderId) {
//     const serviceOrder = await ServiceOrder.findByPk(serviceOrderId, {
//       include: {
//         model: Customer,
//         attributes: [
//           'customer_id', 'name', 'email', 'phone',
//           'company', 'address', 'tin_number'
//         ]
//       }
//     });

//     if (!serviceOrder) throw new Error('Service order not found');
//     if (!serviceOrder.Customer) throw new Error('Customer not found for this service order');

//     return serviceOrder.Customer;
//   }

//   async getCustomersByServiceTypeId(serviceTypeId, queryParams = {}) {
//     const { limit, offset, order, page } = parsePagination(queryParams);

//     const { count, rows } = await Customer.findAndCountAll({
//       include: [{
//         model: ServiceType,
//         where: { service_type_id: serviceTypeId },
//         required: true,
//       }],
//       order,
//       limit,
//       offset,
//     });

//     return {
//       customers: rows,
//       pagination: {
//         total: count,
//         page,
//         limit,
//         totalPages: Math.ceil(count / limit),
//       },
//     };
//   }
// }

