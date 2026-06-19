const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

// Get all schedules
router.get('/', scheduleController.getAllSchedules);

// Get schedule by ID
router.get('/:id', scheduleController.getScheduleById);

// Create new schedule
router.post('/', scheduleController.createSchedule);

// Update schedule
router.put('/:id', scheduleController.updateSchedule);

// Delete schedule
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;
