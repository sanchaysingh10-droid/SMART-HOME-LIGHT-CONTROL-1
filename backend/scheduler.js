const cron = require('node-cron');
const scheduleController = require('./controllers/scheduleController');

let schedulerInstance = null;

// Initialize scheduler to check every minute
function initializeScheduler() {
  // Run every minute at the top of the minute
  schedulerInstance = cron.schedule('* * * * *', () => {
    scheduleController.executePendingSchedules();
  });

  console.log('Schedule executor initialized - checking every minute');
}

// Stop scheduler
function stopScheduler() {
  if (schedulerInstance) {
    schedulerInstance.stop();
    console.log('Schedule executor stopped');
  }
}

module.exports = {
  initializeScheduler,
  stopScheduler
};
