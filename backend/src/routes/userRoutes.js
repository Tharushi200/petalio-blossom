const router = require('express').Router();
const { getAllUsers, getUserById, updateUserStatus, deleteUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/',              authenticate, authorize('ADMIN', 'BUSINESS_OFFICER'), getAllUsers);
router.get('/:id',           authenticate, authorize('ADMIN', 'BUSINESS_OFFICER'), getUserById);
router.patch('/:id/status',  authenticate, authorize('ADMIN', 'BUSINESS_OFFICER'), updateUserStatus);
router.delete('/:id',        authenticate, authorize('ADMIN'), deleteUser);

module.exports = router;
