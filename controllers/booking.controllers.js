class BookingController { 
    async createBooking(req, res) {
        const { serviceId, userId, date, time } = req.body;

        try {
            const newBooking = await req.pool.query(
                'INSERT INTO "Bookings" (service_id, user_id, booking_date, booking_time) VALUES ($1, $2, $3, $4) RETURNING *',
                [serviceId, userId, date, time] 
            );
 
            res.status(201).json(newBooking.rows[0]);
        } catch (error) {
            console.log("Ошибка при создании брони:", error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async getBookedTimes(req, res) {
        const { service_id, date } = req.params;

        try {
            const bookedTimes = await req.pool.query(
                'SELECT DISTINCT booking_time FROM "Bookings" WHERE service_id = $1 AND booking_date = $2',
                [service_id, date]
            );
            res.json(bookedTimes.rows.map((row) => row.booking_time));
        } catch (error) {
            console.error("Ошибка при получении забронированных временных интервалов:", error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }

    async cancelBooking(req, res) {
        const { id } = req.params;

        try {
            const result = await req.pool.query(
                'DELETE FROM "Bookings" WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: "Запись не найдена" });
            }

            res.status(200).json({ message: "Запись успешно отменена" });
        } catch (error) {
            console.error("Ошибка при отмене записи:", error);
            res.status(500).json({ message: "Ошибка сервера" });
        }
    }
}

module.exports = new BookingController();
