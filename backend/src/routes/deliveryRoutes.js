const router = require('express').Router();
const { getAllDeliveries, createDelivery, updateDeliveryStatus } = require('../controllers/deliveryController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getAllDeliveries);
router.post('/', authenticate, authorize('ADMIN', 'BUSINESS_OFFICER'), createDelivery);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'BUSINESS_OFFICER'), updateDeliveryStatus);

module.exports = router;
