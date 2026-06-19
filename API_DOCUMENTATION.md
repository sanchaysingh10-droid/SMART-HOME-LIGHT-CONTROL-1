# Smart Home Light Control - API Documentation

## Base URL
```
http://localhost:3000/api
```

---

## Endpoints

### 1. Lights

#### Get All Lights
- **GET** `/lights`
- **Response:**
  ```json
  [
    {
      "id": "light_1",
      "name": "Living Room Ceiling",
      "controlUrl": null,
      "state": false,
      "brightness": 100,
      "dimmable": true,
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ]
  ```

#### Get Light by ID
- **GET** `/lights/:id`
- **Response:** Single light object

#### Create Light
- **POST** `/lights`
- **Request Body:**
  ```json
  {
    "name": "Kitchen Lamp",
    "dimmable": true,
    "controlUrl": null
  }
  ```
- **Response:** Created light object with generated ID

#### Toggle Light On/Off
- **POST** `/lights/:id/toggle`
- **Response:** Updated light object

#### Turn Light On
- **POST** `/lights/:id/on`
- **Response:** Updated light object

#### Turn Light Off
- **POST** `/lights/:id/off`
- **Response:** Updated light object

#### Set Brightness
- **POST** `/lights/:id/brightness`
- **Request Body:**
  ```json
  {
    "brightness": 50
  }
  ```
- **Brightness Range:** 0-100 (percentage)
- **Response:** Updated light object

#### Delete Light
- **DELETE** `/lights/:id`
- **Response:**
  ```json
  {
    "message": "Light deleted successfully"
  }
  ```

---

### 2. Groups

#### Get All Groups
- **GET** `/groups`
- **Response:**
  ```json
  [
    {
      "id": "group_1",
      "name": "Living Room",
      "lightIds": ["light_1"],
      "lights": [
        {
          "id": "light_1",
          "name": "Living Room Ceiling",
          "state": false,
          "brightness": 100,
          "dimmable": true
        }
      ],
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ]
  ```

#### Get Group by ID
- **GET** `/groups/:id`
- **Response:** Single group object with lights details

#### Create Group
- **POST** `/groups`
- **Request Body:**
  ```json
  {
    "name": "Living Room",
    "lightIds": ["light_1", "light_2"]
  }
  ```
- **Response:** Created group object

#### Toggle All Lights in Group
- **POST** `/groups/:id/toggle`
- **Response:** Updated group object

#### Turn On All Lights in Group
- **POST** `/groups/:id/on`
- **Response:** Updated group object

#### Turn Off All Lights in Group
- **POST** `/groups/:id/off`
- **Response:** Updated group object

#### Set Brightness for All Lights in Group
- **POST** `/groups/:id/brightness`
- **Request Body:**
  ```json
  {
    "brightness": 75
  }
  ```
- **Response:** Updated group object

#### Add Light to Group
- **POST** `/groups/:id/lights`
- **Request Body:**
  ```json
  {
    "lightId": "light_2"
  }
  ```
- **Response:** Updated group object

#### Remove Light from Group
- **DELETE** `/groups/:id/lights`
- **Request Body:**
  ```json
  {
    "lightId": "light_2"
  }
  ```
- **Response:** Updated group object

#### Delete Group
- **DELETE** `/groups/:id`
- **Response:**
  ```json
  {
    "message": "Group deleted successfully"
  }
  ```

---

### 3. Schedules

#### Get All Schedules
- **GET** `/schedules`
- **Response:**
  ```json
  [
    {
      "id": "schedule_1",
      "lightId": "light_1",
      "action": "on",
      "time": "07:00",
      "enabled": true,
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ]
  ```

#### Get Schedule by ID
- **GET** `/schedules/:id`
- **Response:** Single schedule object

#### Create Schedule
- **POST** `/schedules`
- **Request Body:**
  ```json
  {
    "lightId": "light_1",
    "action": "on",
    "time": "07:00",
    "enabled": true
  }
  ```
- **Parameters:**
  - `lightId`: ID of the light to control
  - `action`: "on" or "off"
  - `time`: Time in HH:MM format (24-hour)
  - `enabled`: Boolean (default: true)
- **Response:** Created schedule object

#### Update Schedule
- **PUT** `/schedules/:id`
- **Request Body:** (all fields optional)
  ```json
  {
    "action": "off",
    "time": "22:00",
    "enabled": false
  }
  ```
- **Response:** Updated schedule object

#### Delete Schedule
- **DELETE** `/schedules/:id`
- **Response:**
  ```json
  {
    "message": "Schedule deleted successfully"
  }
  ```

---

### 4. Health Check

#### Health Status
- **GET** `/health`
- **Response:**
  ```json
  {
    "status": "ok",
    "timestamp": "2024-01-01T10:00:00.000Z"
  }
  ```

---

## Error Responses

All endpoints return appropriate HTTP status codes:

- **400 Bad Request** - Invalid parameters or malformed request
  ```json
  {
    "error": "Brightness must be between 0 and 100"
  }
  ```

- **404 Not Found** - Resource not found
  ```json
  {
    "error": "Light not found"
  }
  ```

- **500 Internal Server Error** - Server error
  ```json
  {
    "error": "Failed to create light"
  }
  ```

---

## Example Workflows

### Turn on all lights in Living Room at 50% brightness

```bash
# 1. Get the Living Room group ID
curl http://localhost:3000/api/groups

# 2. Turn on the group
curl -X POST http://localhost:3000/api/groups/group_1/on

# 3. Set brightness to 50%
curl -X POST http://localhost:3000/api/groups/group_1/brightness \
  -H "Content-Type: application/json" \
  -d '{"brightness": 50}'
```

### Create a morning routine

```bash
# Schedule bedroom light to turn on at 6:00 AM
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "lightId": "light_2",
    "action": "on",
    "time": "06:00",
    "enabled": true
  }'

# Schedule living room to turn on at 6:30 AM
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "lightId": "light_1",
    "action": "on",
    "time": "06:30",
    "enabled": true
  }'
```

### Create an evening schedule

```bash
# Schedule all lights to turn off at 11:00 PM
curl -X POST http://localhost:3000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{
    "lightId": "light_1",
    "action": "off",
    "time": "23:00",
    "enabled": true
  }'
```

---

## Data Persistence

All data is stored in JSON files located in the `data/` directory:
- `lights.json` - All lights and their states
- `groups.json` - Light groups
- `schedules.json` - Scheduled events

These files persist across server restarts.

---

## CORS

The API includes CORS middleware allowing requests from any origin. This is suitable for development and local network usage.
