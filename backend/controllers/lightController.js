const fs = require('fs');
const path = require('path');

const LIGHTS_FILE = path.join(__dirname, '../data/lights.json');

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

// Utility function to control physical light (simulate HTTP-based control)
async function controlPhysicalLight(light, state) {
  try {
    if (light.controlUrl) {
      // For HTTP-controlled lights, make a request
      const fetch = (await import('node-fetch')).default;
      const url = `${light.controlUrl}?state=${state ? 'on' : 'off'}&brightness=${light.brightness}`;
      console.log(`Controlling light ${light.id} via: ${url}`);
      // In real scenario, handle the response
      return true;
    }
  } catch (err) {
    console.warn(`Could not control physical light: ${err.message}`);
  }
  return true; // Assume success for simulation
}

// Get all lights
exports.getAllLights = (req, res) => {
  const lights = readLights();
  res.json(lights);
};

// Get single light
exports.getLightById = (req, res) => {
  const lights = readLights();
  const light = lights.find(l => l.id === req.params.id);
  if (!light) {
    return res.status(404).json({ error: 'Light not found' });
  }
  res.json(light);
};

// Create new light
exports.createLight = (req, res) => {
  const { name, controlUrl, dimmable } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const lights = readLights();
  const newLight = {
    id: `light_${Date.now()}`,
    name,
    controlUrl: controlUrl || null,
    state: false,
    brightness: 100,
    dimmable: dimmable !== false,
    createdAt: new Date().toISOString()
  };

  lights.push(newLight);
  if (writeLights(lights)) {
    res.status(201).json(newLight);
  } else {
    res.status(500).json({ error: 'Failed to create light' });
  }
};

// Toggle light on/off
exports.toggleLight = async (req, res) => {
  const lights = readLights();
  const lightIndex = lights.findIndex(l => l.id === req.params.id);
  
  if (lightIndex === -1) {
    return res.status(404).json({ error: 'Light not found' });
  }

  const light = lights[lightIndex];
  light.state = !light.state;
  light.updatedAt = new Date().toISOString();

  // Control the physical light
  await controlPhysicalLight(light, light.state);

  if (writeLights(lights)) {
    res.json(light);
  } else {
    res.status(500).json({ error: 'Failed to toggle light' });
  }
};

// Set light brightness
exports.setBrightness = async (req, res) => {
  const { brightness } = req.body;

  if (brightness === undefined || brightness < 0 || brightness > 100) {
    return res.status(400).json({ error: 'Brightness must be between 0 and 100' });
  }

  const lights = readLights();
  const lightIndex = lights.findIndex(l => l.id === req.params.id);
  
  if (lightIndex === -1) {
    return res.status(404).json({ error: 'Light not found' });
  }

  const light = lights[lightIndex];
  
  if (!light.dimmable) {
    return res.status(400).json({ error: 'Light is not dimmable' });
  }

  light.brightness = brightness;
  light.updatedAt = new Date().toISOString();

  // Control the physical light
  await controlPhysicalLight(light, light.state);

  if (writeLights(lights)) {
    res.json(light);
  } else {
    res.status(500).json({ error: 'Failed to set brightness' });
  }
};

// Turn light on
exports.turnOn = async (req, res) => {
  const lights = readLights();
  const lightIndex = lights.findIndex(l => l.id === req.params.id);
  
  if (lightIndex === -1) {
    return res.status(404).json({ error: 'Light not found' });
  }

  const light = lights[lightIndex];
  light.state = true;
  light.updatedAt = new Date().toISOString();

  await controlPhysicalLight(light, true);

  if (writeLights(lights)) {
    res.json(light);
  } else {
    res.status(500).json({ error: 'Failed to turn on light' });
  }
};

// Turn light off
exports.turnOff = async (req, res) => {
  const lights = readLights();
  const lightIndex = lights.findIndex(l => l.id === req.params.id);
  
  if (lightIndex === -1) {
    return res.status(404).json({ error: 'Light not found' });
  }

  const light = lights[lightIndex];
  light.state = false;
  light.updatedAt = new Date().toISOString();

  await controlPhysicalLight(light, false);

  if (writeLights(lights)) {
    res.json(light);
  } else {
    res.status(500).json({ error: 'Failed to turn off light' });
  }
};

// Delete light
exports.deleteLight = (req, res) => {
  const lights = readLights();
  const filteredLights = lights.filter(l => l.id !== req.params.id);
  
  if (filteredLights.length === lights.length) {
    return res.status(404).json({ error: 'Light not found' });
  }

  if (writeLights(filteredLights)) {
    res.json({ message: 'Light deleted successfully' });
  } else {
    res.status(500).json({ error: 'Failed to delete light' });
  }
};
