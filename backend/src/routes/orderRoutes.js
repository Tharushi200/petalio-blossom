const router = require('express').Router();
const { getAllOrders, getOrderById, createOrder, updateOrderStatus, orderValidation } = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/',          authenticate, getAllOrders);
router.get('/:id',       authenticate, getOrderById);
router.post('/',         authenticate, authorize('CUSTOMER'), orderValidation, validate, createOrder);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'BUSINESS_OFFICER'), updateOrderStatus);

module.exports = router;
