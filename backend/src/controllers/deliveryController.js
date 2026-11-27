const { Delivery, Order, User } = require('../models');

// GET /api/deliveries
const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findAll({
      include: [
        { model: Order, as: 'order' },
        { model: User, as: 'officer', attributes: ['user_id', 'name', 'email'] },
      ],
      order: [['delivery_id', 'DESC']],
    });
    return res.json({ success: true, data: deliveries });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error fetching deliveries.' });
  }
};

// POST /api/deliveries
const createDelivery = async (req, res) => {
  try {
    const { order_id, business_officer_id, delivery_date, status, delivery_code } = req.body;
    const officerId = business_officer_id || req.user.user_id;
    const code = delivery_code || `DEL-${Date.now().toString().slice(-4)}`;

    const delivery = await Delivery.create({
      delivery_code: code,
      order_id,
      business_officer_id: officerId,
      delivery_date: delivery_date || new Date(),
      status: status || 'SCHEDULED',
    });

    return res.status(201).json({ success: true, message: 'Delivery scheduled successfully.', data: delivery });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message || 'Server error creating delivery.' });
  }
};

// PATCH /api/deliveries/:id/status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found.' });

    await delivery.update({ status });
    return res.json({ success: true, message: 'Delivery status updated.', data: delivery });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error updating delivery.' });
  }
};

module.exports = {
  getAllDeliveries,
  createDelivery,
  updateDeliveryStatus,
};
