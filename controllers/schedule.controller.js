const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path'); 

class ScheduleController {
    // Создаем новый график
    async createNewSchedule(req, res) {
        const { service_id, time_slots, day_of_week } = req.body;
        try {
            const newSchedule = await req.pool.query(
                'INSERT INTO "Schedules" ("service_id", "time_slots", "day_of_week") VALUES ($1, $2, $3) RETURNING *',
                [service_id, time_slots, day_of_week]
            );
            res.json(newSchedule.rows[0]);
        } catch (error) {
            console.error('Ошибка при создании расписания:', error);
            res.status(500).json({ message: 'Ошибка при создании расписания' });
        }
    }

    // Получаем расписание по идентификатору услуги
    async getScheduleByServiceId(req, res) {
        const { serviceId } = req.params;
        try {
            const scheduleData = await req.pool.query(
                'SELECT day_of_week, time_slots FROM "Schedules" WHERE service_id = $1',
                [serviceId]
            );
            res.json(scheduleData.rows);
        } catch (error) {
            console.error('Ошибка при получении расписания:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Получаем все расписания
    async getSchedules(req, res) {
        try {
            const result = await req.pool.query('SELECT * FROM "Schedules"');
            res.json(result.rows);
        } catch (error) {
            console.error('Ошибка при получении всех расписаний:', error);
            res.status(500).json({ message: 'Ошибка при получении расписания' });
        }
    }
}

module.exports = new ScheduleController();
