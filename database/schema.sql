-- ============================================================
-- Petalio Blossom - Clean Database Schema (MySQL / MariaDB)
-- NIBM Higher Diploma Final Project
-- Cut-Flower Farm, Order & Inventory Management System
-- Matches:
--   1. Historical Sales Dataset: flower_sales_historical.csv (19 Flowers, Variety, Color, Season)
--   2. Clean, Student-Friendly Basic Columns (No Over-Complicated Clutter)
--   3. Business Officer & Admin Management Screens
-- ============================================================

-- 1. Reset / Drop old database if already exists
DROP DATABASE IF EXISTS petalio_blossom;
CREATE DATABASE petalio_blossom;
USE petalio_blossom;

-- ------------------------------------------------------------
-- 1. Users & Authentication
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('ADMIN', 'BUSINESS_OFFICER', 'CUSTOMER', 'SUPPLIER') NOT NULL,
    status ENUM('PENDING', 'ACTIVE', 'REJECTED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 2. Customer Profiles
-- Basic customer info: name/company, contact, address, city
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY,
    company_name VARCHAR(120) NULL,
    contact_number VARCHAR(20) NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(50) DEFAULT 'Colombo',
    registered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 3. Supplier Profiles (Farm Growers)
-- Basic supplier info: farm name, contact, region, approval status
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INT PRIMARY KEY,
    farm_name VARCHAR(120) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    region VARCHAR(60) DEFAULT 'Nuwara Eliya',
    address VARCHAR(255) NOT NULL,
    monthly_capacity INT DEFAULT 15000,
    is_approved BOOLEAN DEFAULT FALSE,
    registered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 4. Business Officer Profiles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_officers (
    officer_id INT PRIMARY KEY,
    contact_number VARCHAR(20),
    department VARCHAR(80) DEFAULT 'Operations & Logistics',
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (officer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 5. Flower Catalogue
-- Matches the 19 flower types, variety, color, and price from dataset
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flowers (
    flower_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    variety VARCHAR(50) DEFAULT 'Standard',
    color VARCHAR(30) DEFAULT 'White',
    unit_price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255) DEFAULT '/rose.jpg',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 6. Supplier-Flower Relationship (Which farm supplies which flowers)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_flowers (
    supplier_flower_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    flower_id INT NOT NULL,
    supply_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_supplier_flower (supplier_id, flower_id),
    FOREIGN KEY (supplier_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (flower_id) REFERENCES flowers(flower_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 7. Warehouse Inventory
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    flower_id INT UNIQUE NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 50,
    last_restocked TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (flower_id) REFERENCES flowers(flower_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 8. Customer Orders
-- Matches Order_ID and Season_Event from historical dataset
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(30) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    officer_id INT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    season_event VARCHAR(50) DEFAULT 'Normal',
    delivery_address VARCHAR(255) NULL,
    delivery_city VARCHAR(50) DEFAULT 'Colombo',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    payment_status ENUM('UNPAID', 'PAID') DEFAULT 'UNPAID',
    status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    FOREIGN KEY (customer_id) REFERENCES users(user_id),
    FOREIGN KEY (officer_id) REFERENCES users(user_id)
);

-- ------------------------------------------------------------
-- 9. Order Items
-- Matches Flower, Variety, Color, Qty, Unit Price, Total Amount from dataset
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    flower_id INT NOT NULL,
    variety VARCHAR(50) DEFAULT 'Standard',
    color VARCHAR(30) DEFAULT 'White',
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (flower_id) REFERENCES flowers(flower_id)
);

-- ------------------------------------------------------------
-- 10. Place Order (Farm Procurement from Suppliers)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS place_orders (
    place_order_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    flower_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'ACCEPTED', 'RECEIVED', 'REJECTED') DEFAULT 'PENDING',
    FOREIGN KEY (supplier_id) REFERENCES users(user_id),
    FOREIGN KEY (flower_id) REFERENCES flowers(flower_id)
);

-- ------------------------------------------------------------
-- 11. Supplier Harvest Capacity (Declared Harvest Availability)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_capacity (
    capacity_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    flower_id INT NOT NULL,
    declared_quantity INT NOT NULL,
    harvest_date DATE NOT NULL,
    status ENUM('AVAILABLE', 'COMMITTED', 'COMPLETED') DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES users(user_id),
    FOREIGN KEY (flower_id) REFERENCES flowers(flower_id)
);

-- ------------------------------------------------------------
-- 12. Deliveries (Order Dispatch & Transport)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deliveries (
    delivery_id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_code VARCHAR(30) UNIQUE NULL,
    order_id INT NOT NULL UNIQUE,
    vehicle_number VARCHAR(50) DEFAULT 'Van #PB-01',
    driver_name VARCHAR(100) DEFAULT 'Kamal Bandara',
    driver_phone VARCHAR(20) DEFAULT '+94 77 123 4567',
    destination_address VARCHAR(255) NULL,
    scheduled_date DATE NULL,
    status ENUM('SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'FAILED') DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- ------------------------------------------------------------
-- 13. Customer Invoices
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(30) UNIQUE NOT NULL,
    order_id INT NOT NULL UNIQUE,
    customer_name VARCHAR(120) NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE NULL,
    status ENUM('UNPAID', 'PAID', 'CANCELLED') DEFAULT 'UNPAID',
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- ------------------------------------------------------------
-- 14. Customer Payments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('CARD', 'BANK_TRANSFER', 'CASH') NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('SUCCESS', 'PENDING', 'FAILED') DEFAULT 'SUCCESS',
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id)
);

-- ------------------------------------------------------------
-- 15. Supplier Payments (Disbursements to Farmers)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_payments (
    supplier_payment_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('BANK_TRANSFER', 'CASH') DEFAULT 'BANK_TRANSFER',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'COMPLETED') DEFAULT 'COMPLETED',
    FOREIGN KEY (supplier_id) REFERENCES users(user_id)
);

-- ------------------------------------------------------------
-- 16. Business Expenses
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expenses (
    expense_id INT AUTO_INCREMENT PRIMARY KEY,
    officer_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    expense_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (officer_id) REFERENCES users(user_id)
);

-- ------------------------------------------------------------
-- 17. Customer Ratings & Reviews
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rating_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_id INT NOT NULL,
    flower_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(user_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (flower_id) REFERENCES flowers(flower_id)
);

-- ------------------------------------------------------------
-- 18. Notifications
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) DEFAULT 'Alert',
    message TEXT NOT NULL,
    status ENUM('UNREAD', 'READ') DEFAULT 'UNREAD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ------------------------------------------------------------
-- 19. Demand Forecasts (Outputs from ML Model)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS demand_forecasts (
    forecast_id INT AUTO_INCREMENT PRIMARY KEY,
    flower_id INT NOT NULL,
    season_event VARCHAR(50) DEFAULT 'Normal',
    predicted_demand INT NOT NULL,
    unit_price DECIMAL(10, 2) DEFAULT 300.00,
    forecast_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (flower_id) REFERENCES flowers(flower_id)
);

-- ============================================================
-- 20. Clean Initial Seed Data
-- ============================================================

-- A. Default Users & Credentials
INSERT INTO users (user_id, name, email, password_hash, phone, role, status) VALUES
(1, 'Dr. K. Wickramasinghe', 'admin@petalio.lk',   '$2b$10$eIYaQzBVHgSq08dCS/9Gre54d1/R3lYskTVG4YofYK4oGXokoEISm', '+94 77 111 2233', 'ADMIN',            'ACTIVE'),
(2, 'Anuki Perera',          'officer@petalio.lk', '$2b$10$o496LMRD4tM.A55B./H2UeDbOp6LHNmAan/gfg4f7bvboI..Z9q1S', '+94 77 123 4567', 'BUSINESS_OFFICER', 'ACTIVE'),
(3, 'Manjula Rajapaksha',    'sunil@ella.lk',      '$2b$10$C0EcyK6LlR8TmmPoBFfIEe5DgBCBqj8jyveVSCkLm0S/M8WR9XNQG', '+94 71 234 5678', 'SUPPLIER',         'ACTIVE'),
(4, 'Gamini Disanayake',     'nimal@hakgala.lk',   '$2b$10$C0EcyK6LlR8TmmPoBFfIEe5DgBCBqj8jyveVSCkLm0S/M8WR9XNQG', '+94 77 345 6789', 'SUPPLIER',         'PENDING'),
(5, 'Dilshan Perera',        'dilshan@gmail.com',  '$2b$10$vru7vvMkV.BiUZqxyf30PeVSZTLNLYo56N03DX0.ytsB4.1AHehAC', '+94 77 333 4455', 'CUSTOMER',         'ACTIVE'),
(6, 'Ananya Senanayake',     'ananya@gmail.com',   '$2b$10$vru7vvMkV.BiUZqxyf30PeVSZTLNLYo56N03DX0.ytsB4.1AHehAC', '+94 76 555 6677', 'CUSTOMER',         'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name), status=VALUES(status);

-- B. User Profile Entities
INSERT INTO business_officers (officer_id, contact_number, department) VALUES
(2, '+94 77 123 4567', 'Floriculture Operations & Logistics')
ON DUPLICATE KEY UPDATE contact_number=VALUES(contact_number);

INSERT INTO suppliers (supplier_id, farm_name, contact_number, region, address, monthly_capacity, is_approved) VALUES
(3, 'Hakgala Highland Flora',         '+94 71 234 5678', 'Nuwara Eliya', 'Passara Road, Hakgala',       22000, TRUE),
(4, 'Welimada Mist Orchid Nurseries', '+94 77 345 6789', 'Welimada',     'Green Valley, Boralanda',     14000, FALSE)
ON DUPLICATE KEY UPDATE farm_name=VALUES(farm_name), is_approved=VALUES(is_approved);

INSERT INTO customers (customer_id, company_name, contact_number, address, city) VALUES
(5, 'The Kingsbury Hotel Colombo', '+94 77 333 4455', '48 Janadhipathi Mawatha', 'Colombo 01'),
(6, 'Shangri-La Banquets',         '+94 76 555 6677', '1 Galle Face',            'Colombo 02')
ON DUPLICATE KEY UPDATE company_name=VALUES(company_name), address=VALUES(address);

-- C. Flower Catalogue (19 Varieties matching Dataset 1:1)
INSERT INTO flowers (flower_id, name, category, variety, color, unit_price, image_url, description) VALUES
(1,  'Rose',             'Rose',             'Standard',   'Red',     350.00, '/rose.jpg',                                                                           'Grade A long-stem luxury roses cultivated in Nuwara Eliya misty hills.'),
(2,  'Orchid',           'Orchid',           'Dendrobium', 'White',   420.00, '/orchid.jpg',                                                                         'Upscale tropical highland shaded orchid sprays for corporate & wedding styling.'),
(3,  'Lily',             'Lily',             'Oriental',   'White',   830.00, '/lily.jpg',                                                                           'Fragrant Oriental white lilies with stately stems grown in Ambewela alpine fields.'),
(4,  'Carnation',        'Carnation',        'Standard',   'Red',     300.00, '/carnation.jpg',                                                                      'Long-lasting ruffled cut carnations from Hakgala terraced estates.'),
(5,  'Chrysanthemum',    'Chrysanthemum',    'Standard',   'White',   240.00, '/chrysanthemum.jpg',                                                                  'Traditional festival bloom harvested across Welimada plateau for temple ceremonies.'),
(6,  'Gerbera',          'Gerbera',          'Standard',   'Red',     200.00, '/daisies.jpg',                                                                        'Large daisy-like blooms from Bandarawela, bright commercial bouquet filler.'),
(7,  'Lisianthus',       'Lisianthus',       'Standard',   'White',   510.00, '/lisianthus.jpg',                                                                     'Double-petaled eustoma grandiflorum with extended 14-day vase life.'),
(8,  'Lavender',         'Lavender',         'English',    'Purple',  975.00, '/sea_lavenders.jpg',                                                                  'Aromatic English lavender with papery violet florets, dried & fresh styling.'),
(9,  "Baby's Breath",    "Baby's Breath",   'Standard',   'White',  1500.00, '/baby_breath.jpg',                                                                    'Airy cloud gypsophila bunches, essential bridal bouquet foundation.'),
(10, 'Sunflower',        'Sunflower',        'Standard',   'Yellow',  270.00, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80', 'Golden yellow cut sunflowers harvested from Pedro Highlands.'),
(11, 'Tulip',            'Tulip',            'Standard',   'Red',     710.00, 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=600&q=80', 'Imported Grade-A elegant Dutch tulips for luxury VIP banquets.'),
(12, 'Hydrangea',        'Hydrangea',        'Standard',   'White',  1000.00, 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=600&q=80', 'Massive lush round floral heads grown in Hakgala temperate climate.'),
(13, 'Peony',            'Peony',            'Standard',   'Pink',   1760.00, 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=600&q=80', 'Opulent luxury blooms in soft blush, premier flower for bridal arches.'),
(14, 'Freesia',          'Freesia',          'Standard',   'White',   420.00, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80', 'Sweetly scented funnel-shaped flowers popular in bridal perfumed decor.'),
(15, 'Bird of Paradise', 'Bird of Paradise', 'Standard',   'Orange',  800.00, 'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=600&q=80', 'Stately exotic crane flower with vivid plumage, architectural focal bloom.'),
(16, 'Ranunculus',       'Ranunculus',       'Standard',   'Orange',  995.00, 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80', 'Layered papery petals resembling mini roses, favorite among Colombo florists.'),
(17, 'Tuberose',         'Tuberose',         'Single',     'White',   265.00, 'https://images.unsplash.com/photo-1533616688419-b7a585564566?auto=format&fit=crop&w=600&q=80', 'Intensely fragrant white floral spikes used extensively for garlands & banquets.'),
(18, 'Eucalyptus',       'Eucalyptus',       'Baby Blue',  'Green',   250.00, 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80', 'Aromatic silver-green rounded foliage, indispensable filler greenery.'),
(19, 'Alstroemeria',     'Alstroemeria',     'Standard',   'Pink',    280.00, 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?auto=format&fit=crop&w=600&q=80', 'Lily of the Incas with multiple miniature blooms per stem, long vase life.')
ON DUPLICATE KEY UPDATE name=VALUES(name), category=VALUES(category), unit_price=VALUES(unit_price);

-- D. Warehouse Inventory
INSERT INTO inventory (inventory_id, flower_id, stock_quantity, reorder_level) VALUES
(1,  1,  185, 50),
(2,  2,  95,  40),
(3,  3,  60,  40),
(4,  4,  220, 60),
(5,  5,  140, 50),
(6,  6,  45,  50),
(7,  7,  130, 50),
(8,  8,  160, 50),
(9,  9,  250, 70),
(10, 10, 90,  30),
(11, 11, 75,  35),
(12, 12, 50,  25),
(13, 13, 35,  20),
(14, 14, 80,  35),
(15, 15, 65,  30),
(16, 16, 55,  25),
(17, 17, 120, 45),
(18, 18, 175, 50),
(19, 19, 140, 45)
ON DUPLICATE KEY UPDATE stock_quantity=VALUES(stock_quantity), reorder_level=VALUES(reorder_level);

-- E. Supplier Harvest Capacity
INSERT INTO supplier_capacity (capacity_id, supplier_id, flower_id, declared_quantity, harvest_date, status) VALUES
(1, 3, 1, 600, CURDATE(), 'AVAILABLE'),
(2, 3, 3, 350, CURDATE(), 'AVAILABLE'),
(3, 4, 2, 400, CURDATE(), 'AVAILABLE')
ON DUPLICATE KEY UPDATE declared_quantity=VALUES(declared_quantity);

-- F. Customer Orders (Aligned with Historical Dataset)
INSERT INTO orders (order_id, order_code, customer_id, officer_id, season_event, delivery_city, total_amount, payment_status, status) VALUES
(1, 'ORD-1001', 5, 2, 'Normal',          'Colombo', 14400.00, 'PAID',   'CONFIRMED'),
(2, 'ORD-1002', 6, 2, 'Normal',          'Colombo', 34135.00, 'UNPAID', 'PENDING'),
(3, 'ORD-1003', 5, 2, 'Wedding Season',  'Colombo', 52145.00, 'PAID',   'SHIPPED'),
(4, 'ORD-1004', 6, 2, "Valentine's Day", 'Colombo', 22050.00, 'PAID',   'DELIVERED')
ON DUPLICATE KEY UPDATE order_code=VALUES(order_code), status=VALUES(status);

-- G. Order Items
INSERT INTO order_items (order_item_id, order_id, flower_id, variety, color, quantity, price, total_price) VALUES
(1, 1, 4, 'Standard', 'White', 45, 320.00, 14400.00),
(2, 2, 1, 'Standard', 'Yellow', 43, 295.00, 12685.00),
(3, 2, 9, 'Standard', 'White', 15, 1430.00, 21450.00),
(4, 3, 3, 'Oriental', 'White', 10, 850.00, 8500.00),
(5, 3, 1, 'Standard', 'Red', 63, 335.00, 21105.00),
(6, 3, 8, 'French',   'Purple', 23, 980.00, 22540.00),
(7, 4, 1, 'Standard', 'Red', 56, 325.00, 18200.00),
(8, 4, 14, 'Standard', 'Purple', 10, 385.00, 3850.00)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity), price=VALUES(price);

-- H. Deliveries
INSERT INTO deliveries (delivery_id, delivery_code, order_id, vehicle_number, driver_name, driver_phone, destination_address, status) VALUES
(1, 'DEL-101', 1, 'Van #PB-01', 'Kamal Bandara', '+94 77 123 4567', 'The Kingsbury Hotel, Colombo 01', 'SCHEDULED'),
(2, 'DEL-102', 3, 'Van #PB-04', 'Sunil Fonseka', '+94 71 876 5432', 'The Kingsbury Hotel, Colombo 01', 'IN_TRANSIT'),
(3, 'DEL-103', 4, 'Van #PB-02', 'Dinesh Silva',  '+94 76 999 8877', 'Shangri-La Hotel, Colombo 02',    'DELIVERED')
ON DUPLICATE KEY UPDATE delivery_code=VALUES(delivery_code), status=VALUES(status);

-- I. Invoices
INSERT INTO invoices (invoice_id, invoice_number, order_id, customer_name, total_amount, status) VALUES
(1, 'INV-2026-001', 1, 'The Kingsbury Hotel Colombo', 14400.00, 'PAID'),
(2, 'INV-2026-002', 2, 'Shangri-La Banquets',         34135.00, 'UNPAID'),
(3, 'INV-2026-003', 3, 'The Kingsbury Hotel Colombo', 52145.00, 'PAID'),
(4, 'INV-2026-004', 4, 'Shangri-La Banquets',         22050.00, 'PAID')
ON DUPLICATE KEY UPDATE invoice_number=VALUES(invoice_number), status=VALUES(status);

-- J. Customer Payments
INSERT INTO payments (payment_id, invoice_id, amount_paid, payment_method, status) VALUES
(1, 1, 14400.00, 'BANK_TRANSFER', 'SUCCESS'),
(2, 3, 52145.00, 'BANK_TRANSFER', 'SUCCESS'),
(3, 4, 22050.00, 'BANK_TRANSFER', 'SUCCESS')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- K. Supplier Payments
INSERT INTO supplier_payments (supplier_payment_id, supplier_id, amount, payment_method, status) VALUES
(1, 3, 85000.00, 'BANK_TRANSFER', 'COMPLETED'),
(2, 4, 42000.00, 'BANK_TRANSFER', 'COMPLETED')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- L. Business Expenses
INSERT INTO expenses (expense_id, officer_id, description, amount) VALUES
(1, 2, 'Delivery van fuel for Nuwara Eliya - Colombo trip', 18500.00),
(2, 2, 'Packaging corrugated boxes & hydration sheets', 32000.00)
ON DUPLICATE KEY UPDATE amount=VALUES(amount);

-- M. Notifications
INSERT INTO notifications (notification_id, user_id, title, message, status) VALUES
(1, 2, 'Low Stock Alert', 'Gerbera stock is currently at 45 stems, below reorder level (50).', 'UNREAD'),
(2, 1, 'Supplier Approval', 'Gamini Disanayake (Welimada) registered as a new supplier.', 'UNREAD'),
(3, 2, 'New Order Placed', 'The Kingsbury Hotel placed order ORD-1003 (Wedding Season).', 'READ')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- N. Demand Forecast Seeds
INSERT INTO demand_forecasts (forecast_id, flower_id, season_event, predicted_demand, unit_price, forecast_date) VALUES
(1, 1, 'Wedding Season',  525, 350.00, CURDATE()),
(2, 3, 'Wedding Season',  280, 830.00, CURDATE()),
(3, 9, "Valentine's Day", 650, 1500.00, CURDATE())
ON DUPLICATE KEY UPDATE predicted_demand=VALUES(predicted_demand);
