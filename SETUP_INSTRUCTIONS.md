# Smart Home Light Control - Setup Instructions

## Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Start the Server

```bash
npm start
```

You should see:
```
Smart Home Light Control Server running on http://localhost:3000
Dashboard available at http://localhost:3000
```

### 3. Open the Dashboard

Open your web browser and go to:
```
http://localhost:3000
```

---

## Features Overview

### Lights Tab
- **Add New Light**: Create individual lights with optional HTTP control URLs
- **Toggle**: Turn lights on/off individually
- **Brightness**: Adjust brightness (0-100%) for dimmable lights
- **Details Modal**: Advanced control for each light

### Groups Tab
- **Create Groups**: Group multiple lights together (e.g., "Living Room")
- **Group Control**: Control all lights in a group simultaneously
- **Manage Members**: Add/remove lights from groups
- **Group Brightness**: Set brightness for all lights at once

### Schedules Tab
- **Time-Based Automation**: Schedule lights to turn on/off at specific times
- **Format**: Use 24-hour time format (e.g., 07:00, 19:30)
- **Enable/Disable**: Toggle schedules on/off without deleting them
- **Automatic Execution**: Schedules run automatically and persist across server restarts

---

## Supported Hardware

### 1. HTTP-Controlled Lights (Easiest Setup)

For any WiFi-enabled smart light that accepts HTTP requests.

**Setup:**
1. Add a new light in the dashboard
2. Enter the light's HTTP control URL
   - Example: `http://192.168.1.100/api/light`
   - Should accept parameters: `?state=on&brightness=80`

**Example with Tasmota (open-source firmware):**
- Device IP: `192.168.1.50`
- Control URL: `http://192.168.1.50/cm?cmnd=Power`

### 2. Zigbee Lights

For Zigbee protocol lights, integrate with a Zigbee gateway:

**Setup Steps:**
1. Set up a Zigbee coordinator (e.g., Zigbee2MQTT)
2. Pair your lights with the coordinator
3. For Zigbee2MQTT:
   ```bash
   # Install Zigbee2MQTT bridge
   docker run -d --name zigbee2mqtt -v ~/.zigbee2mqtt:/app/data/configuration.yaml -p 8080:8080 koenkk/zigbee2mqtt
   ```
4. Add light with control URL pointing to the bridge API

### 3. Wi-Fi Bulbs (Philips Hue, LIFX, etc.)

**Philips Hue Example:**
1. Set up your Hue Bridge on your network
2. Get the bridge IP and your username (API token)
3. Control URL format: `http://[bridge-ip]/api/[username]/lights/[light-id]/state`

**LIFX Example:**
1. Get your LIFX API token from: https://cloud.lifx.com/settings
2. Control URL: `https://api.lifx.com/v1/lights/all/state`

### 4. Generic IR Relay (Simulate Locally)

For testing without real hardware:
1. Just add lights without a control URL
2. The system will simulate on/off states
3. Perfect for learning and development

---

## Data Storage

The system uses simple JSON files for storage:

```
backend/data/
├── lights.json       # All lights and their current states
├── groups.json       # Light groups
└── schedules.json    # Scheduled events
```

**Data persists automatically** - no database setup needed!

### Manual Data Management

**Backup your data:**
```bash
cp -r backend/data backend/data.backup
```

**Reset to defaults:**
```bash
# Delete the data files (they'll be recreated on next run)
rm backend/data/*.json
npm start
```

---

## Development Mode

For continuous development with auto-reload:

```bash
cd backend
npm run dev
```

This uses the `--watch` flag to restart on file changes.

---

## API Testing

### Using curl

Test the API directly:

```bash
# Get all lights
curl http://localhost:3000/api/lights

# Turn on a light
curl -X POST http://localhost:3000/api/lights/light_1/on

# Set brightness to 50%
curl -X POST http://localhost:3000/api/lights/light_1/brightness \
  -H "Content-Type: application/json" \
  -d '{"brightness": 50}'

# Check server health
curl http://localhost:3000/api/health
```

### Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import the requests from API_DOCUMENTATION.md
3. Test endpoints directly

---

## Common Issues & Troubleshooting

### Issue: "Port 3000 already in use"
**Solution:**
```bash
# Find and kill the process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use a different port
PORT=3001 npm start
```

### Issue: "Cannot find module 'express'"
**Solution:**
```bash
npm install
```

### Issue: Schedules not executing
**Solution:**
1. Check server is running
2. Verify schedule time format (must be HH:MM, 24-hour)
3. Ensure schedule is enabled
4. Check browser console for errors

### Issue: HTTP light control not working
**Solution:**
1. Verify the light's control URL is reachable
2. Test the URL directly: `curl http://light-ip/endpoint`
3. Check the light device logs for errors

---

## Security Note

This system is designed for **local network use only**:
- No user authentication
- No encryption (use only on trusted networks)
- All data is stored unencrypted

For internet access, add authentication and SSL/TLS.

---

## Advanced Configuration

### Custom Server Port

```bash
PORT=8080 npm start
```

### Change Data Directory

Edit `backend/controllers/*.js` and update:
```javascript
const DATA_DIR = './path/to/custom/data';
```

### Extend with MQTT

To add MQTT support for other devices:
1. Install MQTT library: `npm install mqtt`
2. Create `backend/mqtt.js` with MQTT connection logic
3. Update `lightController.js` to use MQTT publisher

---

## Performance Tips

1. **Limit Groups**: Keep groups under 50 lights for optimal performance
2. **Schedule Granularity**: Schedules check every minute; sub-minute precision not supported
3. **Large Light Count**: System tested with 100+ lights; performance remains smooth

---

## Next Steps

1. ✅ Start the server
2. ✅ Open dashboard
3. ✅ Add your first light
4. ✅ Create a group
5. ✅ Set up a schedule
6. ✅ Add more lights and automate your home!

---

## Support & Documentation

- **API Docs**: See `API_DOCUMENTATION.md`
- **Backend Code**: All logic in `backend/controllers/`
- **Frontend Code**: Dashboard in `frontend/`

For issues or questions, check:
1. Server console for error messages
2. Browser developer console (F12)
3. Verify endpoint URLs match `API_DOCUMENTATION.md`

---

## License

This project is provided as-is for local smart home automation.
