-- ============================================================
-- Petalio Blossom - Clean Database Schema (MySQL / MariaDB)
-- NIBM Higher Diploma Final Project
-- Cut-Flower Farm, Order & Inventory Management System
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
-- company_name → customer_name
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY,
    customer_name VARCHAR(120) NULL,
    contact_number VARCHAR(20) NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(50) DEFAULT 'Colombo',
    registered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 3. Supplier Profiles (Farm Growers)
-- farm_name → supplier_name, region → city
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suppliers (
    supplier_id INT PRIMARY KEY,
    supplier_name VARCHAR(120) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    city VARCHAR(60) DEFAULT 'Nuwara Eliya',
    address VARCHAR(255) NOT NULL,
    monthly_capacity INT DEFAULT 15000,
    is_approved BOOLEAN DEFAULT FALSE,
    registered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 4. Business Officer Profiles
-- Added: name column | Removed: department column
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS business_officers (
    officer_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (officer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 5. Flower Catalogue
-- Removed: variety (variety is in order_items only)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS flowers (
    flower_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    color VARCHAR(30) DEFAULT 'White',
    unit_price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255) DEFAULT '/rose.jpg',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 6. Supplier-Flower Relationship
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
-- Removed: flower_id, supplier_id, total_amount
-- Added: inventory_id
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_code VARCHAR(30) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    officer_id INT NULL,
    inventory_id INT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    season_event VARCHAR(50) DEFAULT 'Normal',
    delivery_address VARCHAR(255) NULL,
    delivery_city VARCHAR(50) DEFAULT 'Colombo',
    payment_status ENUM('UNPAID', 'PAID') DEFAULT 'UNPAID',
    status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    FOREIGN KEY (customer_id) REFERENCES users(user_id),
    FOREIGN KEY (officer_id) REFERENCES users(user_id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id)
);

-- ------------------------------------------------------------
-- 9. Order Items
-- Added: inventory_id (FK)
-- Removed: variety, color, total_price
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    flower_id INT NOT NULL,
    inventory_id INT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (flower_id) REFERENCES flowers(flower_id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id)
);

-- ------------------------------------------------------------
-- 10. Place Order (Farm Procurement from Suppliers)
-- Removed: flower_id, supplier_id, total_amount
-- Added: inventory_id
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS place_orders (
    place_order_id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'ACCEPTED', 'RECEIVED', 'REJECTED') DEFAULT 'PENDING',
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id)
);

-- ------------------------------------------------------------
-- 11. Deliveries (Order Dispatch & Transport)
-- Renamed: scheduled_date → delivery_date
-- Added: order_id (FK), officer_id (FK)
-- Kept: driver_name, driver_phone, vehicle_number, destination_address
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deliveries (
    delivery_id INT AUTO_INCREMENT PRIMARY KEY,
    delivery_code VARCHAR(30) UNIQUE NULL,
    order_id INT NOT NULL UNIQUE,
    officer_id INT NULL,
    vehicle_number VARCHAR(50) NULL,
    driver_name VARCHAR(100) NULL,
    driver_phone VARCHAR(20) NULL,
    destination_address VARCHAR(255) NULL,
    delivery_date DATE NULL,
    status ENUM('SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'FAILED') DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (officer_id) REFERENCES users(user_id)
);

-- ------------------------------------------------------------
-- 12. Customer Invoices
-- Kept: invoice_number, customer_name, issue_date, due_date
-- Added: date (created_date)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(30) UNIQUE NOT NULL,
    order_id INT NOT NULL UNIQUE,
    customer_name VARCHAR(120) NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE NULL,
    date DATE NULL,
    status ENUM('UNPAID', 'PAID', 'CANCELLED') DEFAULT 'UNPAID',
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- ------------------------------------------------------------
-- 13. Customer Payments
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
-- 14. Supplier Payments
-- Changed: supplier_id → place_order_id (FK)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS supplier_payments (
    supplier_payment_id INT AUTO_INCREMENT PRIMARY KEY,
    place_order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('BANK_TRANSFER', 'CASH') DEFAULT 'BANK_TRANSFER',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'COMPLETED') DEFAULT 'COMPLETED',
    FOREIGN KEY (place_order_id) REFERENCES place_orders(place_order_id)
);

-- ------------------------------------------------------------
-- 15. Business Expenses
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
-- 16. Customer Ratings & Reviews
-- Added: order_id, customer_id, flower_id
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rating_reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    customer_id INT NOT NULL,
    flower_id INT NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (customer_id) REFERENCES users(user_id),
    FOREIGN KEY (flower_id) REFERENCES flowers(flower_id)
);

-- ------------------------------------------------------------
-- 17. Notifications
-- Changed: user_id → order_id (FK)
-- Added: title
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NULL,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('UNREAD', 'READ') DEFAULT 'UNREAD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ------------------------------------------------------------
-- 18. Demand Forecasts (ML Model Output)
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
-- Seed Data
-- ============================================================

-- A. Users
INSERT INTO users (user_id, name, email, password_hash, phone, role, status) VALUES
(1, 'Dr. K. Wickramasinghe', 'admin@petalio.lk',   '$2b$10$eIYaQzBVHgSq08dCS/9Gre54d1/R3lYskTVG4YofYK4oGXokoEISm', '+94 77 111 2233', 'ADMIN',            'ACTIVE'),
(2, 'Anuki Perera',          'officer@petalio.lk', '$2b$10$o496LMRD4tM.A55B./H2UeDbOp6LHNmAan/gfg4f7bvboI..Z9q1S', '+94 77 123 4567', 'BUSINESS_OFFICER', 'ACTIVE'),
(3, 'Manjula Rajapaksha',    'sunil@ella.lk',      '$2b$10$C0EcyK6LlR8TmmPoBFfIEe5DgBCBqj8jyveVSCkLm0S/M8WR9XNQG', '+94 71 234 5678', 'SUPPLIER',         'ACTIVE'),
(4, 'Gamini Disanayake',     'nimal@hakgala.lk',   '$2b$10$C0EcyK6LlR8TmmPoBFfIEe5DgBCBqj8jyveVSCkLm0S/M8WR9XNQG', '+94 77 345 6789', 'SUPPLIER',         'PENDING'),
(5, 'Dilshan Perera',        'dilshan@gmail.com',  '$2b$10$vru7vvMkV.BiUZqxyf30PeVSZTLNLYo56N03DX0.ytsB4.1AHehAC', '+94 77 333 4455', 'CUSTOMER',         'ACTIVE'),
(6, 'Ananya Senanayake',     'ananya@gmail.com',   '$2b$10$vru7vvMkV.BiUZqxyf30PeVSZTLNLYo56N03DX0.ytsB4.1AHehAC', '+94 76 555 6677', 'CUSTOMER',         'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name), status=VALUES(status);

-- B. Business Officers
INSERT INTO business_officers (officer_id, name, contact_number) VALUES
(2, 'Anuki Perera', '+94 77 123 4567')
ON DUPLICATE KEY UPDATE name=VALUES(name), contact_number=VALUES(contact_number);

-- C. Suppliers
INSERT INTO suppliers (supplier_id, supplier_name, contact_number, city, address, monthly_capacity, is_approved) VALUES
(3, 'Hakgala Highland Flora',         '+94 71 234 5678', 'Nuwara Eliya', 'Passara Road, Hakgala',   22000, TRUE),
(4, 'Welimada Mist Orchid Nurseries', '+94 77 345 6789', 'Welimada',     'Green Valley, Boralanda', 14000, FALSE)
ON DUPLICATE KEY UPDATE supplier_name=VALUES(supplier_name), is_approved=VALUES(is_approved);

-- D. Customers
INSERT INTO customers (customer_id, customer_name, contact_number, address, city) VALUES
(5, 'The Kingsbury Hotel Colombo', '+94 77 333 4455', '48 Janadhipathi Mawatha', 'Colombo 01'),
(6, 'Shangri-La Banquets',         '+94 76 555 6677', '1 Galle Face',            'Colombo 02')
ON DUPLICATE KEY UPDATE customer_name=VALUES(customer_name), address=VALUES(address);

-- E. Flower Catalogue (19 Varieties — variety removed from table)
INSERT INTO flowers (flower_id, name, category, color, unit_price, image_url, description) VALUES
(1,  'Rose',             'Rose',             'Red',     350.00, '/rose.jpg',          'Grade A long-stem luxury roses cultivated in Nuwara Eliya misty hills.'),
(2,  'Orchid',           'Orchid',           'White',   420.00, '/orchid.jpg',        'Upscale tropical highland shaded orchid sprays for corporate & wedding styling.'),
(3,  'Lily',             'Lily',             'White',   830.00, '/lily.jpg',          'Fragrant Oriental white lilies with stately stems grown in Ambewela alpine fields.'),
(4,  'Carnation',        'Carnation',        'Red',     300.00, '/carnation.jpg',     'Long-lasting ruffled cut carnations from Hakgala terraced estates.'),
(5,  'Chrysanthemum',    'Chrysanthemum',    'White',   240.00, '/chrysanthemum.jpg', 'Traditional festival bloom harvested across Welimada plateau.'),
(6,  'Gerbera',          'Gerbera',          'Red',     200.00, '/daisies.jpg',       'Large daisy-like blooms from Bandarawela, bright commercial bouquet filler.'),
(7,  'Lisianthus',       'Lisianthus',       'White',   510.00, '/lisianthus.jpg',    'Double-petaled eustoma grandiflorum with extended 14-day vase life.'),
(8,  'Lavender',         'Lavender',         'Purple',  975.00, '/sea_lavenders.jpg', 'Aromatic English lavender with papery violet florets, dried & fresh styling.'),
(9,  "Baby's Breath",    "Baby's Breath",    'White',  1500.00, '/baby_breath.jpg',   'Airy cloud gypsophila bunches, essential bridal bouquet foundation.'),
(10, 'Sunflower',        'Sunflower',        'Yellow',  270.00, '/sunflower.jpg',     'Golden yellow cut sunflowers harvested from Pedro Highlands.'),
(11, 'Tulip',            'Tulip',            'Red',     710.00, '/tulip.jpg',         'Imported Grade-A elegant Dutch tulips for luxury VIP banquets.'),
(12, 'Hydrangea',        'Hydrangea',        'White',  1000.00, '/hydrangea.jpg',     'Massive lush round floral heads grown in Hakgala temperate climate.'),
(13, 'Peony',            'Peony',            'Pink',   1760.00, '/peony.jpg',         'Opulent luxury blooms in soft blush, premier flower for bridal arches.'),
(14, 'Freesia',          'Freesia',          'White',   420.00, '/freesia.jpg',       'Sweetly scented funnel-shaped flowers popular in bridal perfumed decor.'),
(15, 'Bird of Paradise', 'Bird of Paradise', 'Orange',  800.00, '/bird_paradise.jpg', 'Stately exotic crane flower with vivid plumage, architectural focal bloom.'),
(16, 'Ranunculus',       'Ranunculus',       'Orange',  995.00, '/ranunculus.jpg',    'Layered papery petals resembling mini roses, favorite among Colombo florists.'),
(17, 'Tuberose',         'Tuberose',         'White',   265.00, '/tuberose.jpg',      'Intensely fragrant white floral spikes used extensively for garlands & banquets.'),
(18, 'Eucalyptus',       'Eucalyptus',       'Green',   250.00, '/eucalyptus.jpg',    'Aromatic silver-green rounded foliage, indispensable filler greenery.'),
(19, 'Alstroemeria',     'Alstroemeria',     'Pink',    280.00, '/alstroemeria.jpg',  'Lily of the Incas with multiple miniature blooms per stem, long vase life.')
ON DUPLICATE KEY UPDATE name=VALUES(name), category=VALUES(category), unit_price=VALUES(unit_price);

-- F. Warehouse Inventory
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

-- G. Customer Orders
INSERT INTO orders (order_id, order_code, customer_id, officer_id, season_event, delivery_city, payment_status, status) VALUES
(1, 'ORD-1001', 5, 2, 'Normal',          'Colombo', 'PAID',   'CONFIRMED'),
(2, 'ORD-1002', 6, 2, 'Normal',          'Colombo', 'UNPAID', 'PENDING'),
(3, 'ORD-1003', 5, 2, 'Wedding Season',  'Colombo', 'PAID',   'SHIPPED'),
(4, 'ORD-1004', 6, 2, "Valentine's Day", 'Colombo', 'PAID',   'DELIVERED')
ON DUPLICATE KEY UPDATE order_code=VALUES(order_code), status=VALUES(status);

-- H. Order Items (inventory_id added)
INSERT INTO order_items (order_item_id, order_id, flower_id, inventory_id, quantity, price) VALUES
(1, 1, 4,  4,  45, 320.00),
(2, 2, 1,  1,  43, 295.00),
(3, 2, 9,  9,  15, 1430.00),
(4, 3, 3,  3,  10, 850.00),
(5, 3, 1,  1,  63, 335.00),
(6, 3, 8,  8,  23, 980.00),
(7, 4, 1,  1,  56, 325.00),
(8, 4, 14, 14, 10, 385.00)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity), price=VALUES(price);

-- I. Deliveries (delivery_date, officer_id added)
INSERT INTO deliveries (delivery_id, delivery_code, order_id, officer_id, vehicle_number, driver_name, driver_phone, destination_address, delivery_date, status) VALUES
(1, 'DEL-101', 1, 2, 'Van #PB-01', 'Kamal Bandara', '+94 77 123 4567', 'The Kingsbury Hotel, Colombo 01', CURDATE(), 'SCHEDULED'),
(2, 'DEL-102', 3, 2, 'Van #PB-04', 'Sunil Fonseka', '+94 71 876 5432', 'The Kingsbury Hotel, Colombo 01', CURDATE(), 'IN_TRANSIT'),
(3, 'DEL-103', 4, 2, 'Van #PB-02', 'Dinesh Silva',  '+94 76 999 8877', 'Shangri-La Hotel, Colombo 02',    CURDATE(), 'DELIVERED')
ON DUPLICATE KEY UPDATE delivery_code=VALUES(delivery_code), status=VALUES(status);

-- J. Invoices
INSERT INTO invoices (invoice_id, invoice_number, order_id, customer_name, total_amount, due_date, status) VALUES
(1, 'INV-2026-001', 1, 'The Kingsbury Hotel Colombo', 14400.00, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'PAID'),
(2, 'INV-2026-002', 2, 'Shangri-La Banquets',         34135.00, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'UNPAID'),
(3, 'INV-2026-003', 3, 'The Kingsbury Hotel Colombo', 52145.00, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'PAID'),
(4, 'INV-2026-004', 4, 'Shangri-La Banquets',         22050.00, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'PAID')
ON DUPLICATE KEY UPDATE invoice_number=VALUES(invoice_number), status=VALUES(status);

-- K. Customer Payments
INSERT INTO payments (payment_id, invoice_id, amount_paid, payment_method, status) VALUES
(1, 1, 14400.00, 'BANK_TRANSFER', 'SUCCESS'),
(2, 3, 52145.00, 'BANK_TRANSFER', 'SUCCESS'),
(3, 4, 22050.00, 'BANK_TRANSFER', 'SUCCESS')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- L. Place Orders (inventory_id instead of supplier/flower)
INSERT INTO place_orders (place_order_id, inventory_id, quantity, unit_price, status) VALUES
(1, 1, 500, 280.00, 'ACCEPTED'),
(2, 3, 200, 650.00, 'PENDING')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- M. Supplier Payments (place_order_id FK)
INSERT INTO supplier_payments (supplier_payment_id, place_order_id, amount, payment_method, status) VALUES
(1, 1, 140000.00, 'BANK_TRANSFER', 'COMPLETED'),
(2, 2, 130000.00, 'BANK_TRANSFER', 'PENDING')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- N. Business Expenses
INSERT INTO expenses (expense_id, officer_id, description, amount) VALUES
(1, 2, 'Delivery van fuel for Nuwara Eliya - Colombo trip', 18500.00),
(2, 2, 'Packaging corrugated boxes & hydration sheets',     32000.00)
ON DUPLICATE KEY UPDATE amount=VALUES(amount);

-- O. Rating & Reviews
INSERT INTO rating_reviews (review_id, order_id, customer_id, flower_id, rating, comment) VALUES
(1, 1, 5, 4, 5, 'Beautiful fresh carnations, delivered on time!'),
(2, 4, 6, 1, 4, 'Lovely roses, slightly late delivery but quality was great.')
ON DUPLICATE KEY UPDATE rating=VALUES(rating);

-- P. Notifications (order_id + user_id)
INSERT INTO notifications (notification_id, order_id, user_id, title, message, status) VALUES
(1, NULL, 2, 'Low Stock Alert',   'Gerbera stock is currently at 45 stems, below reorder level (50).', 'UNREAD'),
(2, NULL, 1, 'Supplier Approval', 'Gamini Disanayake (Welimada) registered as a new supplier.',        'UNREAD'),
(3, 3,    2, 'New Order Placed',  'The Kingsbury Hotel placed order ORD-1003 (Wedding Season).',       'READ')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Q. Demand Forecast Seeds
INSERT INTO demand_forecasts (forecast_id, flower_id, season_event, predicted_demand, unit_price, forecast_date) VALUES
(1, 1, 'Wedding Season',  525, 350.00,  CURDATE()),
(2, 3, 'Wedding Season',  280, 830.00,  CURDATE()),
(3, 9, "Valentine's Day", 650, 1500.00, CURDATE())
ON DUPLICATE KEY UPDATE predicted_demand=VALUES(predicted_demand);
