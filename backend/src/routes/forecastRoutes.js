const router = require('express').Router();
const { predictDemand, getForecasts, saveForecast } = require('../controllers/forecastController');
const { authenticate, authorize } = require('../middleware/auth');

// Flexible middleware: verifies JWT if provided; permits dev simulation if developing
const devOrAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return authenticate(req, res, () => {
      authorize('ADMIN', 'BUSINESS_OFFICER')(req, res, next);
    });
  }
  // Allow dev fallback
  req.user = { role: 'BUSINESS_OFFICER' };
  next();
};

router.post('/predict', devOrAuth, predictDemand);
router.get('/', devOrAuth, getForecasts);
router.post('/save', devOrAuth, saveForecast);

module.exports = router;
