const fs = require('fs');
const path = require('path');

const SCHEDULES_FILE = path.join(__dirname, '../data/schedules.json');
const LIGHTS_FILE = path.join(__dirname, '../data/lights.json');

// Utility functions
function readSchedules() {
  try {
    if (fs.existsSync(SCHEDULES_FILE)) {
      const data = fs.readFileSync(SCHEDULES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading schedules:', err);
  }
  return [];
}

function writeSchedules(schedules) {
  try {
    fs.writeFileSync(SCHEDULES_FILE, JSON.stringify(schedules, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing schedules:', err);
    return false;
  }
}

function readLights() {
  try {
    if (fs.existsSync(LIGHTS_FILE)) {
      const data = fs.readFileSync(LIGHTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading lights:', err);
  }
  return [];
}

function writeLights(lights) {
  try {
    fs.writeFileSync(LIGHTS_FILE, JSON.stringify(lights, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing lights:', err);
    return false;
  }
}

// Get all schedules
exports.getAllSchedules = (req, res) => {
  const schedules = readSchedules();
  res.json(schedules);
};

// Get schedule by ID
exports.getScheduleById = (req, res) => {
  const schedules = readSchedules();
  const schedule = schedules.find(s => s.id === req.params.id);
  
  if (!schedule) {
    return res.status(404).json({ error: 'Schedule not found' });
  }

  res.json(schedule);
};

// Create new schedule
exports.createSchedule = (req, res) => {
  const { lightId, action, time, enabled } = req.body;

  if (!lightId || !action || !time) {
    return res.status(400).json({ error: 'lightId, action, and time are required' });
  }

  if (!['on', 'off'].includes(action)) {
    return res.status(400).json({ error: 'action must be "on" or "off"' });
  }

  // Validate time format (HH:MM)
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return res.status(400).json({ error: 'time must be in HH:MM format' });
  }

  const lights = readLights();
  if (!lights.some(l => l.id === lightId)) {
    return res.status(404).json({ error: 'Light not found' });
  }

  const schedules = readSchedules();
  const newSchedule = {
    id: `schedule_${Date.now()}`,
    lightId,
    action,
    time,
    enabled: enabled !== false,
    createdAt: new Date().toISOString()
  };

  schedules.push(newSchedule);
  if (writeSchedules(schedules)) {
    res.status(201).json(newSchedule);
  } else {
    res.status(500).json({ error: 'Failed to create schedule' });
  }
};

// Update schedule
exports.updateSchedule = (req, res) => {
  const { action, time, enabled } = req.body;

  const schedules = readSchedules();
  const scheduleIndex = schedules.findIndex(s => s.id === req.params.id);

  if (scheduleIndex === -1) {
    return res.status(404).json({ error: 'Schedule not found' });
  }

  if (action && !['on', 'off'].includes(action)) {
    return res.status(400).json({ error: 'action must be "on" or "off"' });
  }

  if (time && !/^\d{2}:\d{2}$/.test(time)) {
    return res.status(400).json({ error: 'time must be in HH:MM format' });
  }

  const schedule = schedules[scheduleIndex];
  if (action) schedule.action = action;
  if (time) schedule.time = time;
  if (enabled !== undefined) schedule.enabled = enabled;
  schedule.updatedAt = new Date().toISOString();

  if (writeSchedules(schedules)) {
    res.json(schedule);
  } else {
    res.status(500).json({ error: 'Failed to update schedule' });
  }
};

// Delete schedule
exports.deleteSchedule = (req, res) => {
  const schedules = readSchedules();
  const filteredSchedules = schedules.filter(s => s.id !== req.params.id);

  if (filteredSchedules.length === schedules.length) {
    return res.status(404).json({ error: 'Schedule not found' });
  }

  if (writeSchedules(filteredSchedules)) {
    res.json({ message: 'Schedule deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
};

// Execute pending schedules (called by scheduler)
exports.executePendingSchedules = () => {
  const schedules = readSchedules();
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  let lights = readLights();
  let lightsUpdated = false;

  schedules.forEach(schedule => {
    if (schedule.enabled && schedule.time === currentTime) {
      const lightIndex = lights.findIndex(l => l.id === schedule.lightId);
      if (lightIndex !== -1) {
        if (schedule.action === 'on') {
          lights[lightIndex].state = true;
        } else if (schedule.action === 'off') {
          lights[lightIndex].state = false;
        }
        lights[lightIndex].updatedAt = new Date().toISOString();
        lightsUpdated = true;
        console.log(`[Schedule] Turned ${schedule.action} light ${schedule.lightId} at ${currentTime}`);
      }
    }
  });

  if (lightsUpdated) {
    writeLights(lights);
  }
};
