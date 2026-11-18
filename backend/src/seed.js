require('dotenv').config();
const bcrypt = require('bcryptjs');
const { 
  sequelize, User, Customer, Supplier, BusinessOfficer, 
  Flower, Inventory, Order, OrderItem, Delivery, SupplierCapacity,
  Invoice, Payment, SupplierPayment, Expense, Notification, DemandForecast
} = require('./models');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('🌱 Connected to database for seeding...');

    // 1. Users & Passwords
    console.log('👤 Seeding Users & Roles...');
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const officerPassword = await bcrypt.hash('Officer@123', 10);
    const supplierPassword = await bcrypt.hash('Supplier@123', 10);
    const customerPassword = await bcrypt.hash('Customer@123', 10);

    // Admin
    await User.findOrCreate({
      where: { email: 'admin@petalio.lk' },
      defaults: {
        name: 'Dr. K. Wickramasinghe',
        email: 'admin@petalio.lk',
        password_hash: adminPassword,
        phone: '+94 77 111 2233',
        role: 'ADMIN',
        status: 'ACTIVE',
      }
    });

    // Business Officer
    const [officerUser] = await User.findOrCreate({
      where: { email: 'officer@petalio.lk' },
      defaults: {
        name: 'Anuki Perera',
        email: 'officer@petalio.lk',
        password_hash: officerPassword,
        phone: '+94 77 123 4567',
        role: 'BUSINESS_OFFICER',
        status: 'ACTIVE',
      }
    });

    await BusinessOfficer.findOrCreate({
      where: { officer_id: officerUser.user_id },
      defaults: {
        officer_id: officerUser.user_id,
        contact_number: '+94 77 123 4567',
        department: 'Operations & Logistics',
      }
    });

    // Suppliers (Basic & clean)
    const suppliersData = [
      {
        name: 'Manjula Rajapaksha',
        email: 'sunil@ella.lk',
        farm_name: 'Hakgala Highland Flora',
        phone: '+94 71 234 5678',
        region: 'Nuwara Eliya',
        address: 'Passara Road, Hakgala',
        monthly_capacity: 22000,
        is_approved: true,
      },
      {
        name: 'Gamini Disanayake',
        email: 'nimal@hakgala.lk',
        farm_name: 'Welimada Mist Orchid Nurseries',
        phone: '+94 77 345 6789',
        region: 'Welimada',
        address: 'Green Valley, Boralanda',
        monthly_capacity: 14000,
        is_approved: false,
      },
    ];

    const seededSuppliers = [];
    for (const sup of suppliersData) {
      const [u] = await User.findOrCreate({
        where: { email: sup.email },
        defaults: {
          name: sup.name,
          email: sup.email,
          password_hash: supplierPassword,
          phone: sup.phone,
          role: 'SUPPLIER',
          status: 'ACTIVE',
        }
      });
      await Supplier.findOrCreate({
        where: { supplier_id: u.user_id },
        defaults: {
          supplier_id: u.user_id,
          farm_name: sup.farm_name,
          contact_number: sup.phone,
          region: sup.region,
          address: sup.address,
          monthly_capacity: sup.monthly_capacity,
          is_approved: sup.is_approved,
        }
      });
      seededSuppliers.push({ ...sup, user_id: u.user_id });
    }

    // Customers (Basic & clean)
    const customersData = [
      {
        name: 'Dilshan Perera',
        email: 'dilshan@gmail.com',
        phone: '+94 77 333 4455',
        company_name: 'The Kingsbury Hotel Colombo',
        address: '48 Janadhipathi Mawatha',
        city: 'Colombo 01',
      },
      {
        name: 'Ananya Senanayake',
        email: 'ananya@gmail.com',
        phone: '+94 76 555 6677',
        company_name: 'Shangri-La Banquets',
        address: '1 Galle Face',
        city: 'Colombo 02',
      },
    ];

    const seededCustomers = [];
    for (const cust of customersData) {
      const [u] = await User.findOrCreate({
        where: { email: cust.email },
        defaults: {
          name: cust.name,
          email: cust.email,
          password_hash: customerPassword,
          phone: cust.phone,
          role: 'CUSTOMER',
          status: 'ACTIVE',
        }
      });
      await Customer.findOrCreate({
        where: { customer_id: u.user_id },
        defaults: {
          customer_id: u.user_id,
          company_name: cust.company_name,
          contact_number: cust.phone,
          address: cust.address,
          city: cust.city,
        }
      });
      seededCustomers.push({ ...cust, user_id: u.user_id });
    }

    // 2. Flowers Catalogue (19 Varieties matching Dataset 1:1)
    console.log('🌸 Seeding Flowers Catalogue (19 Varieties) & Inventory...');
    const flowersData = [
      { id: 1,  name: 'Rose',             category: 'Rose',             variety: 'Standard',   color: 'Red',    unit_price: 350.00, image: '/rose.jpg',           stock: 185, reorder: 50 },
      { id: 2,  name: 'Orchid',           category: 'Orchid',           variety: 'Dendrobium', color: 'White',  unit_price: 420.00, image: '/orchid.jpg',         stock: 95,  reorder: 40 },
      { id: 3,  name: 'Lily',             category: 'Lily',             variety: 'Oriental',   color: 'White',  unit_price: 830.00, image: '/lily.jpg',           stock: 60,  reorder: 40 },
      { id: 4,  name: 'Carnation',        category: 'Carnation',        variety: 'Standard',   color: 'Red',    unit_price: 300.00, image: '/carnation.jpg',      stock: 220, reorder: 60 },
      { id: 5,  name: 'Chrysanthemum',    category: 'Chrysanthemum',    variety: 'Standard',   color: 'White',  unit_price: 240.00, image: '/chrysanthemum.jpg',  stock: 140, reorder: 50 },
      { id: 6,  name: 'Gerbera',          category: 'Gerbera',          variety: 'Standard',   color: 'Red',    unit_price: 200.00, image: '/daisies.jpg',        stock: 45,  reorder: 50 },
      { id: 7,  name: 'Lisianthus',       category: 'Lisianthus',       variety: 'Standard',   color: 'White',  unit_price: 510.00, image: '/lisianthus.jpg',     stock: 130, reorder: 50 },
      { id: 8,  name: 'Lavender',         category: 'Lavender',         variety: 'English',    color: 'Purple', unit_price: 975.00, image: '/sea_lavenders.jpg',  stock: 160, reorder: 50 },
      { id: 9,  name: "Baby's Breath",    category: "Baby's Breath",   variety: 'Standard',   color: 'White', 1500.00, image: '/baby_breath.jpg',    stock: 250, reorder: 70 },
      { id: 10, name: 'Sunflower',        category: 'Sunflower',        variety: 'Standard',   color: 'Yellow', 270.00, image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600', stock: 90, reorder: 30 },
      { id: 11, name: 'Tulip',            category: 'Tulip',            variety: 'Standard',   color: 'Red',    710.00, image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600', stock: 75, reorder: 35 },
      { id: 12, name: 'Hydrangea',        category: 'Hydrangea',        variety: 'Standard',   color: 'White', 1000.00, image: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600', stock: 50, reorder: 25 },
      { id: 13, name: 'Peony',            category: 'Peony',            variety: 'Standard',   color: 'Pink',  1760.00, image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600', stock: 35, reorder: 20 },
      { id: 14, name: 'Freesia',          category: 'Freesia',          variety: 'Standard',   color: 'White',  420.00, image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600', stock: 80, reorder: 35 },
      { id: 15, name: 'Bird of Paradise', category: 'Bird of Paradise', variety: 'Standard',   color: 'Orange', 800.00, image: 'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?w=600', stock: 65, reorder: 30 },
      { id: 16, name: 'Ranunculus',       category: 'Ranunculus',       variety: 'Standard',   color: 'Orange', 995.00, image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600', stock: 55, reorder: 25 },
      { id: 17, name: 'Tuberose',         category: 'Tuberose',         variety: 'Single',     color: 'White',  265.00, image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?w=600', stock: 120, reorder: 45 },
      { id: 18, name: 'Eucalyptus',       category: 'Eucalyptus',       variety: 'Baby Blue',  color: 'Green',  250.00, image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600', stock: 175, reorder: 50 },
      { id: 19, name: 'Alstroemeria',     category: 'Alstroemeria',     variety: 'Standard',   color: 'Pink',   280.00, image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=600', stock: 140, reorder: 45 },
    ];

    for (const fl of flowersData) {
      const [flower] = await Flower.findOrCreate({
        where: { name: fl.name },
        defaults: {
          flower_id: fl.id,
          name: fl.name,
          category: fl.category,
          variety: fl.variety,
          color: fl.color,
          unit_price: fl.unit_price,
          image_url: fl.image,
          description: `Fresh cut flower stems cultivated in highland estates.`,
        }
      });

      await Inventory.findOrCreate({
        where: { flower_id: flower.flower_id },
        defaults: {
          flower_id: flower.flower_id,
          stock_quantity: fl.stock,
          reorder_level: fl.reorder,
        }
      });
    }

    // 3. Customer Orders
    console.log('📦 Seeding Orders & Deliveries...');
    const ordersData = [
      {
        order_code: 'ORD-1001',
        customer_id: seededCustomers[0].user_id,
        season_event: 'Normal',
        total_amount: 14400.00,
        status: 'CONFIRMED',
        payment_status: 'PAID',
        items: [
          { flower_id: 4, variety: 'Standard', color: 'White', quantity: 45, price: 320.00, total_price: 14400.00 },
        ]
      },
      {
        order_code: 'ORD-1002',
        customer_id: seededCustomers[1].user_id,
        season_event: 'Normal',
        total_amount: 34135.00,
        status: 'PENDING',
        payment_status: 'UNPAID',
        items: [
          { flower_id: 1, variety: 'Standard', color: 'Yellow', quantity: 43, price: 295.00, total_price: 12685.00 },
          { flower_id: 9, variety: 'Standard', color: 'White',  quantity: 15, price: 1430.00, total_price: 21450.00 },
        ]
      },
    ];

    for (const ord of ordersData) {
      const [order] = await Order.findOrCreate({
        where: { order_code: ord.order_code },
        defaults: {
          order_code: ord.order_code,
          customer_id: ord.customer_id,
          officer_id: officerUser.user_id,
          season_event: ord.season_event,
          total_amount: ord.total_amount,
          payment_status: ord.payment_status,
          status: ord.status,
        }
      });

      for (const it of ord.items) {
        await OrderItem.findOrCreate({
          where: { order_id: order.order_id, flower_id: it.flower_id },
          defaults: {
            order_id: order.order_id,
            flower_id: it.flower_id,
            variety: it.variety,
            color: it.color,
            quantity: it.quantity,
            price: it.price,
            total_price: it.total_price,
          }
        });
      }

      await Invoice.findOrCreate({
        where: { order_id: order.order_id },
        defaults: {
          invoice_number: `INV-2026-${String(order.order_id).padStart(3, '0')}`,
          order_id: order.order_id,
          customer_name: ord.customer_id === seededCustomers[0].user_id ? 'The Kingsbury Hotel Colombo' : 'Shangri-La Banquets',
          total_amount: ord.total_amount,
          status: ord.payment_status === 'PAID' ? 'PAID' : 'UNPAID',
        }
      });
    }

    console.log('\n======================================================');
    console.log('🎉 Petalio Blossom Database Seeded Successfully!');
    console.log('======================================================');
    console.log('🔑 Credentials:');
    console.log('   Admin:    admin@petalio.lk   / Admin@123');
    console.log('   Officer:  officer@petalio.lk / Officer@123');
    console.log('   Supplier: sunil@ella.lk      / Supplier@123');
    console.log('   Customer: dilshan@gmail.com  / Customer@123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
