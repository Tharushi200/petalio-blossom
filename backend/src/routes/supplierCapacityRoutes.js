const router = require('express').Router();
const { getAllCapacity, createCapacity, updateCapacityStatus, capacityValidation } = require('../controllers/supplierCapacityController');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/',               authenticate, authorize('ADMIN', 'BUSINESS_OFFICER', 'SUPPLIER'), getAllCapacity);
router.post('/',              authenticate, authorize('SUPPLIER'), capacityValidation, validate, createCapacity);
router.patch('/:id/status',   authenticate, authorize('ADMIN', 'BUSINESS_OFFICER'), updateCapacityStatus);

module.exports = router;
