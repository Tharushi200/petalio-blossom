const axios = require('axios');
const { DemandForecast, Flower } = require('../models');

// POST /api/forecasts/predict
const predictDemand = async (req, res) => {
  try {
    const { flower_type, season_event, price_per_unit, date, horizon } = req.body;
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5000';

    // Call Python Flask ML service
    const mlResponse = await axios.post(`${mlServiceUrl}/api/predict`, {
      flower_type: flower_type || 'Rose',
      season_event: season_event || 'Normal',
      price_per_unit: price_per_unit || 300,
      date: date || new Date().toISOString().split('T')[0],
      horizon: horizon || 7
    }, { timeout: 6000 });

    const prediction = mlResponse.data;

    return res.json({ success: true, data: prediction });
  } catch (error) {
    console.error('ML Service connection error:', error.message);
    return res.status(502).json({ 
      success: false, 
      message: 'ML Service (Python Flask) is unreachable on port 5000. Please ensure ml_service/app.py is running.',
      error: error.message 
    });
  }
};

// GET /api/forecasts - Get saved forecasts
const getForecasts = async (req, res) => {
  try {
    const { flower_id, forecast_type } = req.query;
    const where = {};
    if (flower_id)     where.flower_id     = flower_id;
    if (forecast_type) where.forecast_type = forecast_type;

    const forecasts = await DemandForecast.findAll({
      where,
      include: [{ model: Flower, as: 'flower' }],
      order: [['generated_at', 'DESC']],
      limit: 100,
    });
    return res.json({ success: true, data: forecasts });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// POST /api/forecasts/save - Save prediction to DB
const saveForecast = async (req, res) => {
  try {
    const { flower_id, forecast_date, predicted_demand, forecast_type } = req.body;
    const forecast = await DemandForecast.create({ 
      flower_id, 
      forecast_date: forecast_date || new Date(), 
      predicted_demand, 
      forecast_type: forecast_type || 'RANDOM_FOREST'
    });
    return res.status(201).json({ success: true, data: forecast });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = { predictDemand, getForecasts, saveForecast };
