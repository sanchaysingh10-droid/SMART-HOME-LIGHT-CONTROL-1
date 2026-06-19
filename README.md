# 💡 Smart Home Light Control System

A lightweight, single-user smart home light control system for local networks. Control your lights remotely via a web dashboard with support for on/off, brightness adjustment, grouping, and time-based scheduling.

## ✨ Features

### Core Functionality
- **On/Off Control** - Toggle individual lights on or off
- **Brightness Adjustment** - Set brightness level (0–100%) for dimmable lights
- **Scheduling** - Schedule lights to turn on/off at specific times (24-hour format)
- **Grouping** - Group multiple lights together and control them as a unit
- **Web Dashboard** - Simple, intuitive interface for all controls

### Technical Highlights
- **REST API** - Full-featured API for programmatic control
- **Multiple Hardware Support** - HTTP-controlled lights, Zigbee, Wi-Fi bulbs
- **Persistent Storage** - JSON-based storage (no database required)
- **Auto-Scheduling** - Background scheduler runs automatically
- **CORS Enabled** - Ready for local network access

---

## 🚀 Quick Start

### Prerequisites
- Node.js v14+ ([Download](https://nodejs.org/))
- npm (included with Node.js)

### Installation & Run

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Start the server
npm start

# 3. Open in browser
# → http://localhost:3000
```

Done! The dashboard is ready to use.

---

## 📋 Project Structure

```
smart-home-light-control/
├── backend/
│   ├── server.js                    # Express server entry point
│   ├── scheduler.js                 # Schedule execution engine
│   ├── package.json                 # Node.js dependencies
│   ├── controllers/
│   │   ├── lightController.js       # Light operations
│   │   ├── groupController.js       # Group operations
│   │   └── scheduleController.js    # Schedule operations
│   ├── routes/
│   │   ├── lights.js                # Light endpoints
│   │   ├── groups.js                # Group endpoints
│   │   └── schedules.js             # Schedule endpoints
│   └── data/
│       ├── lights.json              # Light data (auto-created)
│       ├── groups.json              # Group data (auto-created)
│       └── schedules.json           # Schedule data (auto-created)
├── frontend/
│   ├── index.html                   # Dashboard UI
│   ├── style.css                    # Styling
│   └── script.js                    # Client logic
├── API_DOCUMENTATION.md             # Complete API reference
├── SETUP_INSTRUCTIONS.md            # Detailed setup guide
└── README.md                        # This file
```

---

## 🎮 Usage

### Dashboard Tabs

#### 1. **Lights**
- Add new lights with optional HTTP control URLs
- Toggle lights individually
- Adjust brightness (for dimmable lights)
- Click "Details" for modal control

#### 2. **Groups**
- Create groups to manage multiple lights together
- Example groups: "Living Room", "Bedroom", "Kitchen"
- Control entire groups with a single click
- Add/remove lights from groups dynamically

#### 3. **Schedules**
- Schedule lights to turn on/off at specific times
- Use 24-hour format (e.g., 07:00, 19:30)
- Enable/disable schedules without deleting them
- Automatic execution every minute

---

## 🔌 Hardware Support

### ✅ Tested & Supported

1. **HTTP-Controlled Lights** (Easiest)
   - Any WiFi light that accepts HTTP requests
   - Enter control URL in the dashboard

2. **Zigbee Lights**
   - Via Zigbee2MQTT coordinator
   - Requires bridge setup

3. **Wi-Fi Smart Bulbs**
   - Philips Hue, LIFX, Wyze, etc.
   - Configure with their API endpoints

4. **Generic Simulation**
   - Test without hardware
   - Perfect for learning

See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for detailed hardware setup.

---

## 🔌 API Endpoints

Quick reference (see [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for details):

### Lights
```
GET    /api/lights              # Get all lights
POST   /api/lights              # Create light
POST   /api/lights/:id/on       # Turn on
POST   /api/lights/:id/off      # Turn off
POST   /api/lights/:id/toggle   # Toggle
POST   /api/lights/:id/brightness  # Set brightness
DELETE /api/lights/:id          # Delete light
```

### Groups
```
GET    /api/groups              # Get all groups
POST   /api/groups              # Create group
POST   /api/groups/:id/on       # Turn on all
POST   /api/groups/:id/off      # Turn off all
POST   /api/groups/:id/toggle   # Toggle all
```

### Schedules
```
GET    /api/schedules           # Get all schedules
POST   /api/schedules           # Create schedule
PUT    /api/schedules/:id       # Update schedule
DELETE /api/schedules/:id       # Delete schedule
```

---

## 💾 Data Storage

All data is stored as JSON files in `backend/data/`:

```
data/
├── lights.json       # Current state of all lights
├── groups.json       # Light groupings
└── schedules.json    # Scheduled events
```

**Persistent**: Data survives server restarts
**Human-readable**: Easy to inspect and backup manually

---

## 🎯 Example Scenarios

### Morning Routine
1. Create a "Bedroom" group with your bedroom lights
2. Schedule bedroom light to turn on at 6:00 AM
3. Schedule living room light to turn on at 6:30 AM

### Evening Automation
1. Group "All Lights" together
2. Schedule all lights to 50% at 8:00 PM
3. Schedule all lights off at 11:00 PM

### Manual Control
1. Open dashboard on any device on your local network
2. Toggle any light on/off
3. Adjust brightness to your preference
4. Control entire rooms with group buttons

---

## 🛠️ Development

### Run in Dev Mode (auto-reload)
```bash
cd backend
npm run dev
```

### Test API with curl
```bash
# Get all lights
curl http://localhost:3000/api/lights

# Turn on light
curl -X POST http://localhost:3000/api/lights/light_1/on

# Set brightness
curl -X POST http://localhost:3000/api/lights/light_1/brightness \
  -H "Content-Type: application/json" \
  -d '{"brightness": 50}'
```

### Test API with Postman
1. Download [Postman](https://www.postman.com/)
2. Use endpoints from [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
3. Test locally at `http://localhost:3000`

---

## ⚙️ Configuration

### Change Server Port
```bash
PORT=8080 npm start
```

### Access from Other Devices
Replace `localhost` with your server's IP:
```
http://192.168.1.100:3000
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 already in use | `lsof -i :3000` then `kill -9 <PID>` or use `PORT=3001` |
| "Cannot find module" | Run `npm install` in backend directory |
| Schedules not running | Verify time format (HH:MM), check if enabled |
| Dashboard not loading | Check browser console (F12), verify server running |
| Light control not working | Test control URL directly, check light device logs |

See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for more solutions.

---

## 📚 Documentation

- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference with examples
- **[SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)** - Detailed setup and hardware guides
- **Dashboard UI** - Interactive controls at `http://localhost:3000`

---

## 🔐 Security

**Note**: This system is designed for **local network use only**:
- ✅ No authentication required (trusted network only)
- ✅ No encryption (HTTPS not configured)
- ✅ Suitable for home/office networks

For internet access, add authentication and SSL/TLS.

---

## 📦 Dependencies

- **express** - Web framework
- **cors** - Cross-origin requests
- **node-cron** - Scheduling engine

All lightweight, battle-tested libraries.

---

## 🚀 Next Steps

1. ✅ Run the server
2. ✅ Open the dashboard
3. ✅ Add your first light
4. ✅ Create a group
5. ✅ Set up automation schedules
6. ✅ Enjoy your smart home!

---

## 📝 License

This project is provided as-is for local smart home automation.

---

## 💡 Tips

- Use groups to manage lights by room
- Schedule lights to turn off before bedtime
- Test HTTP control URLs before adding lights
- Keep the server running 24/7 for automatic schedules
- Access from any device on your network

Happy automating! 🏠✨