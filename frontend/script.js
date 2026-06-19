const API_BASE = 'http://localhost:3000/api';

let currentLightId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadAllData();
});

// Event Listeners
function initializeEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });

    // Forms
    document.getElementById('addLightForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addLight();
    });

    document.getElementById('addGroupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addGroup();
    });

    document.getElementById('addScheduleForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addSchedule();
    });

    // Modal
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target.id === 'lightModal') closeModal();
    });

    document.getElementById('modalTurnOn').addEventListener('click', () => turnOnLight(currentLightId));
    document.getElementById('modalTurnOff').addEventListener('click', () => turnOffLight(currentLightId));
    document.getElementById('modalBrightness').addEventListener('change', (e) => setBrightness(currentLightId, e.target.value));
    document.getElementById('modalDelete').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this light?')) {
            deleteLight(currentLightId);
        }
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// Data Loading
async function loadAllData() {
    await loadLights();
    await loadGroups();
    await loadSchedules();
}

async function loadLights() {
    try {
        const response = await fetch(`${API_BASE}/lights`);
        const lights = await response.json();
        renderLights(lights);
        updateLightSelects(lights);
    } catch (error) {
        console.error('Error loading lights:', error);
        showError('Failed to load lights');
    }
}

async function loadGroups() {
    try {
        const response = await fetch(`${API_BASE}/groups`);
        const groups = await response.json();
        renderGroups(groups);
    } catch (error) {
        console.error('Error loading groups:', error);
        showError('Failed to load groups');
    }
}

async function loadSchedules() {
    try {
        const response = await fetch(`${API_BASE}/schedules`);
        const schedules = await response.json();
        renderSchedules(schedules);
    } catch (error) {
        console.error('Error loading schedules:', error);
        showError('Failed to load schedules');
    }
}

// Rendering
function renderLights(lights) {
    const container = document.getElementById('lightsList');
    const noLights = document.getElementById('noLights');

    if (lights.length === 0) {
        container.innerHTML = '';
        noLights.style.display = 'block';
        return;
    }

    noLights.style.display = 'none';
    container.innerHTML = lights.map(light => `
        <div class="light-card ${light.state ? 'on' : ''}">
            <h3>${light.name}</h3>
            <div class="light-status">
                <div class="status-indicator ${light.state ? 'on' : ''}"></div>
                <span>${light.state ? 'On' : 'Off'}</span>
            </div>
            ${light.dimmable ? `<p>Brightness: ${light.brightness}%</p>` : '<p>Non-dimmable</p>'}
            <div class="light-actions">
                <button class="btn btn-secondary btn-small" onclick="toggleLight('${light.id}')">Toggle</button>
                <button class="btn btn-secondary btn-small" onclick="openLightModal('${light.id}', '${light.name}', ${light.state}, ${light.brightness}, ${light.dimmable})">Details</button>
            </div>
        </div>
    `).join('');
}

function renderGroups(groups) {
    const container = document.getElementById('groupsList');
    const noGroups = document.getElementById('noGroups');

    if (groups.length === 0) {
        container.innerHTML = '';
        noGroups.style.display = 'block';
        return;
    }

    noGroups.style.display = 'none';
    container.innerHTML = groups.map(group => {
        const allOn = group.lights.every(l => l.state);
        const anyOn = group.lights.some(l => l.state);

        return `
            <div class="group-card">
                <h3>${group.name}</h3>
                <div class="group-lights">
                    ${group.lights.map(light => `
                        <div class="light-tag">
                            <div class="status-indicator ${light.state ? 'on' : ''}"></div>
                            <span>${light.name}</span>
                            <span class="remove" onclick="removeLightFromGroup('${group.id}', '${light.id}')">✕</span>
                        </div>
                    `).join('')}
                </div>
                <div class="group-controls">
                    <button class="btn btn-secondary btn-small" onclick="toggleGroup('${group.id}')">Toggle All</button>
                    <button class="btn btn-secondary btn-small" onclick="turnOnGroup('${group.id}')">Turn On</button>
                    <button class="btn btn-secondary btn-small" onclick="turnOffGroup('${group.id}')">Turn Off</button>
                    <button class="btn btn-danger btn-small" onclick="deleteGroup('${group.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderSchedules(schedules) {
    const container = document.getElementById('schedulesList');
    const noSchedules = document.getElementById('noSchedules');

    if (schedules.length === 0) {
        container.innerHTML = '';
        noSchedules.style.display = 'block';
        return;
    }

    noSchedules.style.display = 'none';
    container.innerHTML = schedules.map(schedule => `
        <div class="schedule-card">
            <div class="schedule-info">
                <div>
                    <h3>${schedule.time}</h3>
                    <p class="schedule-time">Turn ${schedule.action.toUpperCase()}</p>
                </div>
                <div class="schedule-action ${schedule.action}">${schedule.action === 'on' ? '🔆' : '🌙'}</div>
            </div>
            <div class="schedule-toggle">
                <span>Enabled:</span>
                <div class="toggle-switch ${schedule.enabled ? 'on' : ''}" onclick="toggleSchedule('${schedule.id}')"></div>
            </div>
            <div class="schedule-actions">
                <button class="btn btn-secondary btn-small" onclick="deleteSchedule('${schedule.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateLightSelects(lights) {
    const groupSelect = document.getElementById('groupLights');
    const scheduleSelect = document.getElementById('scheduleLightId');

    groupSelect.innerHTML = '<option disabled>Select lights to add...</option>' + 
        lights.map(l => `<option value="${l.id}">${l.name}</option>`).join('');

    scheduleSelect.innerHTML = '<option value="">Select a light...</option>' +
        lights.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
}

// Light Operations
async function addLight() {
    const name = document.getElementById('lightName').value;
    const dimmable = document.getElementById('lightDimmable').checked;
    const controlUrl = document.getElementById('lightControlUrl').value || null;

    try {
        const response = await fetch(`${API_BASE}/lights`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, dimmable, controlUrl })
        });

        if (response.ok) {
            document.getElementById('addLightForm').reset();
            showSuccess('Light added successfully');
            loadLights();
        } else {
            showError('Failed to add light');
        }
    } catch (error) {
        console.error('Error adding light:', error);
        showError('Error adding light');
    }
}

async function toggleLight(lightId) {
    try {
        await fetch(`${API_BASE}/lights/${lightId}/toggle`, { method: 'POST' });
        loadLights();
    } catch (error) {
        console.error('Error toggling light:', error);
        showError('Failed to toggle light');
    }
}

async function turnOnLight(lightId) {
    try {
        await fetch(`${API_BASE}/lights/${lightId}/on`, { method: 'POST' });
        loadLights();
        loadGroups();
        closeModal();
    } catch (error) {
        console.error('Error turning on light:', error);
        showError('Failed to turn on light');
    }
}

async function turnOffLight(lightId) {
    try {
        await fetch(`${API_BASE}/lights/${lightId}/off`, { method: 'POST' });
        loadLights();
        loadGroups();
        closeModal();
    } catch (error) {
        console.error('Error turning off light:', error);
        showError('Failed to turn off light');
    }
}

async function setBrightness(lightId, brightness) {
    try {
        const response = await fetch(`${API_BASE}/lights/${lightId}/brightness`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brightness: parseInt(brightness) })
        });

        if (response.ok) {
            document.getElementById('brightnessValue').textContent = brightness;
            loadLights();
            loadGroups();
        }
    } catch (error) {
        console.error('Error setting brightness:', error);
        showError('Failed to set brightness');
    }
}

async function deleteLight(lightId) {
    try {
        const response = await fetch(`${API_BASE}/lights/${lightId}`, { method: 'DELETE' });
        if (response.ok) {
            showSuccess('Light deleted');
            loadLights();
            loadGroups();
            closeModal();
        }
    } catch (error) {
        console.error('Error deleting light:', error);
        showError('Failed to delete light');
    }
}

function openLightModal(lightId, lightName, state, brightness, dimmable) {
    currentLightId = lightId;
    document.getElementById('modalLightName').textContent = lightName;
    document.getElementById('modalBrightness').value = brightness;
    document.getElementById('brightnessValue').textContent = brightness;

    const brightnessControl = document.getElementById('brightnessControl');
    if (dimmable) {
        brightnessControl.style.display = 'block';
    } else {
        brightnessControl.style.display = 'none';
    }

    document.getElementById('lightModal').classList.add('show');
}

function closeModal() {
    document.getElementById('lightModal').classList.remove('show');
}

// Group Operations
async function addGroup() {
    const name = document.getElementById('groupName').value;
    const lightIds = Array.from(document.getElementById('groupLights').selectedOptions).map(o => o.value);

    if (lightIds.length === 0) {
        showError('Select at least one light');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/groups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, lightIds })
        });

        if (response.ok) {
            document.getElementById('addGroupForm').reset();
            showSuccess('Group created successfully');
            loadGroups();
        } else {
            showError('Failed to create group');
        }
    } catch (error) {
        console.error('Error creating group:', error);
        showError('Error creating group');
    }
}

async function toggleGroup(groupId) {
    try {
        await fetch(`${API_BASE}/groups/${groupId}/toggle`, { method: 'POST' });
        loadGroups();
        loadLights();
    } catch (error) {
        console.error('Error toggling group:', error);
        showError('Failed to toggle group');
    }
}

async function turnOnGroup(groupId) {
    try {
        await fetch(`${API_BASE}/groups/${groupId}/on`, { method: 'POST' });
        loadGroups();
        loadLights();
    } catch (error) {
        console.error('Error turning on group:', error);
        showError('Failed to turn on group');
    }
}

async function turnOffGroup(groupId) {
    try {
        await fetch(`${API_BASE}/groups/${groupId}/off`, { method: 'POST' });
        loadGroups();
        loadLights();
    } catch (error) {
        console.error('Error turning off group:', error);
        showError('Failed to turn off group');
    }
}

async function removeLightFromGroup(groupId, lightId) {
    try {
        await fetch(`${API_BASE}/groups/${groupId}/lights`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lightId })
        });
        loadGroups();
    } catch (error) {
        console.error('Error removing light from group:', error);
        showError('Failed to remove light');
    }
}

async function deleteGroup(groupId) {
    if (!confirm('Delete this group?')) return;

    try {
        await fetch(`${API_BASE}/groups/${groupId}`, { method: 'DELETE' });
        showSuccess('Group deleted');
        loadGroups();
    } catch (error) {
        console.error('Error deleting group:', error);
        showError('Failed to delete group');
    }
}

// Schedule Operations
async function addSchedule() {
    const lightId = document.getElementById('scheduleLightId').value;
    const action = document.getElementById('scheduleAction').value;
    const timeInput = document.getElementById('scheduleTime').value;
    
    if (!lightId || !timeInput) {
        showError('Select a light and time');
        return;
    }

    const time = timeInput; // Already in HH:MM format from input type="time"

    try {
        const response = await fetch(`${API_BASE}/schedules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lightId, action, time })
        });

        if (response.ok) {
            document.getElementById('addScheduleForm').reset();
            showSuccess('Schedule created successfully');
            loadSchedules();
        } else {
            const error = await response.json();
            showError(error.error || 'Failed to create schedule');
        }
    } catch (error) {
        console.error('Error creating schedule:', error);
        showError('Error creating schedule');
    }
}

async function toggleSchedule(scheduleId) {
    try {
        const response = await fetch(`${API_BASE}/schedules/${scheduleId}`);
        const schedule = await response.json();

        await fetch(`${API_BASE}/schedules/${scheduleId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: !schedule.enabled })
        });

        loadSchedules();
    } catch (error) {
        console.error('Error toggling schedule:', error);
        showError('Failed to toggle schedule');
    }
}

async function deleteSchedule(scheduleId) {
    if (!confirm('Delete this schedule?')) return;

    try {
        await fetch(`${API_BASE}/schedules/${scheduleId}`, { method: 'DELETE' });
        showSuccess('Schedule deleted');
        loadSchedules();
    } catch (error) {
        console.error('Error deleting schedule:', error);
        showError('Failed to delete schedule');
    }
}

// Utility Functions
function showSuccess(message) {
    console.log('✓', message);
    // You can add a toast notification here if desired
}

function showError(message) {
    console.error('✗', message);
    alert(message);
}
