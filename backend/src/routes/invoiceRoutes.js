const router = require('express').Router();
const { getAllInvoices, createInvoice, updateInvoiceStatus } = require('../controllers/invoiceController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, getAllInvoices);
router.post('/', authenticate, authorize('ADMIN', 'BUSINESS_OFFICER'), createInvoice);
router.patch('/:id/status', authenticate, authorize('ADMIN', 'BUSINESS_OFFICER'), updateInvoiceStatus);

module.exports = router;
