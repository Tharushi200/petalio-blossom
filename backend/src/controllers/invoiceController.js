const { Invoice, Order } = require('../models');

// GET /api/invoices
const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({
      include: [{ model: Order, as: 'order' }],
      order: [['invoice_id', 'DESC']],
    });
    return res.json({ success: true, data: invoices });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error fetching invoices.' });
  }
};

// POST /api/invoices
const createInvoice = async (req, res) => {
  try {
    const { order_id, total_amount, tax_amount, date, status } = req.body;
    const invoice = await Invoice.create({
      order_id,
      total_amount,
      tax_amount: tax_amount || 0.00,
      date: date || new Date(),
      status: status || 'UNPAID',
    });
    return res.status(201).json({ success: true, message: 'Invoice generated successfully.', data: invoice });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message || 'Server error creating invoice.' });
  }
};

// PATCH /api/invoices/:id/status
const updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });

    await invoice.update({ status });
    return res.json({ success: true, message: 'Invoice status updated.', data: invoice });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error updating invoice.' });
  }
};

module.exports = {
  getAllInvoices,
  createInvoice,
  updateInvoiceStatus,
};
