const fs = require('fs');
const path = require('path');
const lightController = require('./lightController');

const GROUPS_FILE = path.join(__dirname, '../data/groups.json');
const LIGHTS_FILE = path.join(__dirname, '../data/lights.json');

// Utility function to read groups
function readGroups() {
  try {
    if (fs.existsSync(GROUPS_FILE)) {
      const data = fs.readFileSync(GROUPS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading groups:', err);
  }
  return [];
}

// Utility function to write groups
function writeGroups(groups) {
  try {
    fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing groups:', err);
    return false;
  }
}

// Utility function to read lights
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

// Utility function to write lights
function writeLights(lights) {
  try {
    fs.writeFileSync(LIGHTS_FILE, JSON.stringify(lights, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing lights:', err);
    return false;
  }
}

// Get all groups
exports.getAllGroups = (req, res) => {
  const groups = readGroups();
  const lights = readLights();
  
  // Enrich groups with light details
  const enrichedGroups = groups.map(group => ({
    ...group,
    lights: group.lightIds.map(id => lights.find(l => l.id === id)).filter(Boolean)
  }));
  
  res.json(enrichedGroups);
};

// Get group by ID
exports.getGroupById = (req, res) => {
  const groups = readGroups();
  const lights = readLights();
  
  const group = groups.find(g => g.id === req.params.id);
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  const enrichedGroup = {
    ...group,
    lights: group.lightIds.map(id => lights.find(l => l.id === id)).filter(Boolean)
  };

  res.json(enrichedGroup);
};

// Create group
exports.createGroup = (req, res) => {
  const { name, lightIds } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const groups = readGroups();
  const lights = readLights();

  // Validate light IDs
  const validLightIds = (lightIds || []).filter(id => lights.some(l => l.id === id));

  const newGroup = {
    id: `group_${Date.now()}`,
    name,
    lightIds: validLightIds,
    createdAt: new Date().toISOString()
  };

  groups.push(newGroup);
  if (writeGroups(groups)) {
    const enrichedGroup = {
      ...newGroup,
      lights: validLightIds.map(id => lights.find(l => l.id === id))
    };
    res.status(201).json(enrichedGroup);
  } else {
    res.status(500).json({ error: 'Failed to create group' });
  }
};

// Toggle all lights in group
exports.toggleGroupLights = async (req, res) => {
  const groups = readGroups();
  const group = groups.find(g => g.id === req.params.id);
  
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  let lights = readLights();
  
  // Toggle all lights in the group
  group.lightIds.forEach(lightId => {
    const lightIndex = lights.findIndex(l => l.id === lightId);
    if (lightIndex !== -1) {
      lights[lightIndex].state = !lights[lightIndex].state;
      lights[lightIndex].updatedAt = new Date().toISOString();
    }
  });

  if (writeLights(lights)) {
    const updatedGroup = {
      ...group,
      lights: group.lightIds.map(id => lights.find(l => l.id === id))
    };
    res.json(updatedGroup);
  } else {
    res.status(500).json({ error: 'Failed to toggle group lights' });
  }
};

// Turn on all lights in group
exports.turnOnGroup = async (req, res) => {
  const groups = readGroups();
  const group = groups.find(g => g.id === req.params.id);
  
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  let lights = readLights();
  
  group.lightIds.forEach(lightId => {
    const lightIndex = lights.findIndex(l => l.id === lightId);
    if (lightIndex !== -1) {
      lights[lightIndex].state = true;
      lights[lightIndex].updatedAt = new Date().toISOString();
    }
  });

  if (writeLights(lights)) {
    const updatedGroup = {
      ...group,
      lights: group.lightIds.map(id => lights.find(l => l.id === id))
    };
    res.json(updatedGroup);
  } else {
    res.status(500).json({ error: 'Failed to turn on group' });
  }
};

// Turn off all lights in group
exports.turnOffGroup = async (req, res) => {
  const groups = readGroups();
  const group = groups.find(g => g.id === req.params.id);
  
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  let lights = readLights();
  
  group.lightIds.forEach(lightId => {
    const lightIndex = lights.findIndex(l => l.id === lightId);
    if (lightIndex !== -1) {
      lights[lightIndex].state = false;
      lights[lightIndex].updatedAt = new Date().toISOString();
    }
  });

  if (writeLights(lights)) {
    const updatedGroup = {
      ...group,
      lights: group.lightIds.map(id => lights.find(l => l.id === id))
    };
    res.json(updatedGroup);
  } else {
    res.status(500).json({ error: 'Failed to turn off group' });
  }
};

// Set brightness for all lights in group
exports.setGroupBrightness = async (req, res) => {
  const { brightness } = req.body;

  if (brightness === undefined || brightness < 0 || brightness > 100) {
    return res.status(400).json({ error: 'Brightness must be between 0 and 100' });
  }

  const groups = readGroups();
  const group = groups.find(g => g.id === req.params.id);
  
  if (!group) {
    return res.status(404).json({ error: 'Group not found' });
  }

  let lights = readLights();
  
  group.lightIds.forEach(lightId => {
    const lightIndex = lights.findIndex(l => l.id === lightId);
    if (lightIndex !== -1 && lights[lightIndex].dimmable) {
      lights[lightIndex].brightness = brightness;
      lights[lightIndex].updatedAt = new Date().toISOString();
    }
  });

  if (writeLights(lights)) {
    const updatedGroup = {
      ...group,
      lights: group.lightIds.map(id => lights.find(l => l.id === id))
    };
    res.json(updatedGroup);
  } else {
    res.status(500).json({ error: 'Failed to set group brightness' });
  }
};

// Add light to group
exports.addLightToGroup = (req, res) => {
  const { lightId } = req.body;

  if (!lightId) {
    return res.status(400).json({ error: 'lightId is required' });
  }

  const groups = readGroups();
  const groupIndex = groups.findIndex(g => g.id === req.params.id);
  
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found' });
  }

  const lights = readLights();
  if (!lights.some(l => l.id === lightId)) {
    return res.status(404).json({ error: 'Light not found' });
  }

  if (groups[groupIndex].lightIds.includes(lightId)) {
    return res.status(400).json({ error: 'Light already in group' });
  }

  groups[groupIndex].lightIds.push(lightId);
  if (writeGroups(groups)) {
    res.json(groups[groupIndex]);
  } else {
    res.status(500).json({ error: 'Failed to add light to group' });
  }
};

// Remove light from group
exports.removeLightFromGroup = (req, res) => {
  const { lightId } = req.body;

  if (!lightId) {
    return res.status(400).json({ error: 'lightId is required' });
  }

  const groups = readGroups();
  const groupIndex = groups.findIndex(g => g.id === req.params.id);
  
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found' });
  }

  groups[groupIndex].lightIds = groups[groupIndex].lightIds.filter(id => id !== lightId);
  
  if (writeGroups(groups)) {
    res.json(groups[groupIndex]);
  } else {
    res.status(500).json({ error: 'Failed to remove light from group' });
  }
};

// Delete group
exports.deleteGroup = (req, res) => {
  const groups = readGroups();
  const filteredGroups = groups.filter(g => g.id !== req.params.id);
  
  if (filteredGroups.length === groups.length) {
    return res.status(404).json({ error: 'Group not found' });
  }

  if (writeGroups(filteredGroups)) {
    res.json({ message: 'Group deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete group' });
  }
};
