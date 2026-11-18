const router = require('express').Router();
const { getAllInventory, getLowStockItems, updateStock } = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/',                     authenticate, authorize('ADMIN', 'BUSINESS_OFFICER'), getAllInventory);
router.get('/low-stock',            authenticate, authorize('ADMIN', 'BUSINESS_OFFICER'), getLowStockItems);
router.patch('/:flower_id',         authenticate, authorize('ADMIN', 'BUSINESS_OFFICER'), updateStock);

module.exports = router;
