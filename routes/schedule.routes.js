const Router = require('express');
const router = new Router();
const scheduleController = require('../controllers/schedule.controller');

router.get('/schedules/:serviceId', scheduleController.getScheduleByServiceId);
router.get('/getAllSchedules', scheduleController.getSchedules);
router.post('/createSchedules', scheduleController.createNewSchedule);

module.exports = router;
 