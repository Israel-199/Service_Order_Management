-- Create Customers Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id      INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    email            VARCHAR(100),
    phone            VARCHAR(20),
    company          TEXT,
    address          TEXT,
    tin_number       VARCHAR(50),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Employees Table (for staff/technicians)
CREATE TABLE IF NOT EXISTS employees (
    employees_id    INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(100),
    phone           VARCHAR(20),
    role            VARCHAR(50),  -- e.g. electrician, networking, admin
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Service_types Table
CREATE TABLE IF NOT EXISTS service_types (
    service_type_id  INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,  -- case-insensitive unique
    slug VARCHAR(100) UNIQUE,           -- optional normalized key
    description      TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Service_orders Table (main table for service orders)
CREATE TABLE IF NOT EXISTS service_orders (
    order_id             INT AUTO_INCREMENT PRIMARY KEY,
    customer_id          INT NOT NULL,
    service_type_id      INT NOT NULL,
    description          TEXT,
    priority             ENUM('normal', 'urgent') DEFAULT 'normal',
    status               ENUM('new','assigned','in_progress','completed','closed') DEFAULT 'new',
    lead_employees_id    INT NULL, -- optional (main tech)

    assigned_at          DATETIME NULL,
    started_at           DATETIME NULL,
    completed_at         DATETIME NULL,
    closed_at            DATETIME NULL,

    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    CONSTRAINT fk_service_type FOREIGN KEY (service_type_id) REFERENCES service_types(service_type_id),
    CONSTRAINT fk_lead_employees FOREIGN KEY (lead_employees_id) REFERENCES employees(employees_id)
);

-- Create Attachments Table
CREATE TABLE IF NOT EXISTS attachments (
    attachment_id    INT AUTO_INCREMENT PRIMARY KEY,
    order_id         INT NOT NULL,
    file_path        VARCHAR(255) NOT NULL,
    file_type        ENUM('image','document','audio'),
    uploaded_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES service_orders(order_id) ON DELETE CASCADE
);

-- Create Recurring_orders Table (optional for recurring schedules)
CREATE TABLE IF NOT EXISTS recurring_orders (
    recurring_id     INT AUTO_INCREMENT PRIMARY KEY,
    order_id         INT NOT NULL,
    recurrence_type  ENUM('daily', 'weekly', 'monthly'),
    next_due_date    DATE,
    end_date         DATE,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recurring_order FOREIGN KEY (order_id) REFERENCES service_orders(order_id) ON DELETE CASCADE
);

-- Create Technician_service_types Table (technician-service type linking table)
-- Correction: technician_id should reference employees_id from the employees table
CREATE TABLE IF NOT EXISTS technician_service_types (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    technician_id        INT NOT NULL,
    service_type_id      INT NOT NULL,

    CONSTRAINT fk_tech FOREIGN KEY (technician_id) REFERENCES employees(employees_id) ON DELETE CASCADE,
    CONSTRAINT fk_type FOREIGN KEY (service_type_id) REFERENCES service_types(service_type_id) ON DELETE CASCADE,
    UNIQUE (technician_id, service_type_id)  -- avoid duplicate mapping
);

-- Create Service_order_items Table (to enable one order to include multiple different services/items)
CREATE TABLE IF NOT EXISTS service_order_items (
    item_id              INT AUTO_INCREMENT PRIMARY KEY,
    order_id             INT NOT NULL,
    service_type_id      INT NOT NULL, -- This links to the type of service item provided
    unit_price           DECIMAL(10,2) NOT NULL,
    quantity             INT NOT NULL,
    total_price          DECIMAL(10,2) GENERATED ALWAYS AS (unit_price * quantity) STORED,

    CONSTRAINT fk_item_order FOREIGN KEY (order_id) REFERENCES service_orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_item_service FOREIGN KEY (service_type_id) REFERENCES service_types(service_type_id) ON DELETE RESTRICT
);

-- Create Service_order_assignments Table (enables admin to assign more than one employee for a service order)
CREATE TABLE IF NOT EXISTS service_order_assignments (
    assignment_id    INT AUTO_INCREMENT PRIMARY KEY,
    order_id         INT NOT NULL,
    employees_id     INT NOT NULL,
    role_in_order    VARCHAR(50),      -- lead, assistant, etc.
    assigned_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    unassigned_at    DATETIME NULL,
    notes            TEXT,

    CONSTRAINT fk_assignment_order
        FOREIGN KEY (order_id) REFERENCES service_orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_emp
        FOREIGN KEY (employees_id) REFERENCES employees(employees_id) ON DELETE CASCADE,
    UNIQUE (order_id, employees_id)  -- prevent duplicates
);

-- Create Service_order_status_history Table (tracks the lifecycle of a service order)
CREATE TABLE IF NOT EXISTS service_order_status_history (
    history_id      INT AUTO_INCREMENT PRIMARY KEY,
    order_id        INT NOT NULL,
    old_status      ENUM('new','assigned','in_progress','completed','closed') NULL,
    new_status      ENUM('new','assigned','in_progress','completed','closed') NOT NULL,
    changed_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    changed_by      INT NULL, -- could reference an employees or users table for who changed it
    comment         TEXT,

    CONSTRAINT fk_history_order
        FOREIGN KEY (order_id) REFERENCES service_orders(order_id) ON DELETE CASCADE,
    INDEX idx_history_order (order_id),
    INDEX idx_history_changed (changed_at)
);