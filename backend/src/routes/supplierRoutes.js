const router = require('express').Router();
const { getAllSuppliers, createSupplier, updateSupplierApproval } = require('../controllers/supplierController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getAllSuppliers);
router.post('/', authenticate, authorize('ADMIN', 'BUSINESS_OFFICER'), createSupplier);
router.patch('/:id/approval', authenticate, authorize('ADMIN'), updateSupplierApproval);

module.exports = router;
