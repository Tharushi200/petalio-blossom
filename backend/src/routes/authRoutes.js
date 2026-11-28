const router = require('express').Router();
const { register, registerValidation, login, loginValidation, getProfile, forgotPassword, resetPassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.post('/register', registerValidation, validate, register);
router.post('/login',    loginValidation,    validate, login);
router.get('/profile',   authenticate,       getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  resetPassword);

module.exports = router;
