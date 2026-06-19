const express = require('express');
const router = express.Router();
const lightController = require('../controllers/lightController');

// Get all lights
router.get('/', lightController.getAllLights);

// Get single light
router.get('/:id', lightController.getLightById);

// Create new light
router.post('/', lightController.createLight);

// Toggle light
router.post('/:id/toggle', lightController.toggleLight);

// Turn on light
router.post('/:id/on', lightController.turnOn);

// Turn off light
router.post('/:id/off', lightController.turnOff);

// Set brightness
router.post('/:id/brightness', lightController.setBrightness);

// Delete light
router.delete('/:id', lightController.deleteLight);

module.exports = router;
