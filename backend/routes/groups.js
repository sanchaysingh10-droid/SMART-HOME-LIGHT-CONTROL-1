const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Get all groups
router.get('/', groupController.getAllGroups);

// Get group by ID
router.get('/:id', groupController.getGroupById);

// Create new group
router.post('/', groupController.createGroup);

// Toggle all lights in group
router.post('/:id/toggle', groupController.toggleGroupLights);

// Turn on all lights in group
router.post('/:id/on', groupController.turnOnGroup);

// Turn off all lights in group
router.post('/:id/off', groupController.turnOffGroup);

// Set brightness for all lights in group
router.post('/:id/brightness', groupController.setGroupBrightness);

// Add light to group
router.post('/:id/lights', groupController.addLightToGroup);

// Remove light from group
router.delete('/:id/lights', groupController.removeLightFromGroup);

// Delete group
router.delete('/:id', groupController.deleteGroup);

module.exports = router;
