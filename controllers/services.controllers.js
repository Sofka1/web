// title - Название услуги
// description - Описание услуги
// duration - Время
// format - Формат услуги
// cost - Цена 
// image - Картинка услуги

class ServicesController {
    async createServices(req, res) {
        try {
            // Извлекаем параметры из тела запроса
            const { title, description, duration, format, cost, image } = req.body;
    
            // Выполняем запрос на вставку данных
            const newServices = await req.pool.query(
                'INSERT INTO "Services" ("title", "description", "duration", "format", "cost", "image") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [title, description, duration, format, cost, image]
            );
    
            // Отправляем ответ с созданной услугой
            res.json(newServices.rows[0]);
        } catch (error) {
            // Ловим и логируем ошибку
            console.error('Ошибка при создании услуги:', error);
            res.status(500).json({ message: 'Ошибка сервера при создании услуги' });
        }
    }

    async getAllServices(req, res) {
        try {
            const services = await req.pool.query('SELECT * FROM "Services"');
            res.json(services.rows);
        } catch (error) {
            res.status(500).json({ message: 'Ошибка при получении услуг', error: error.message });
        }
    }

    async deleteService(req, res) {
        const id = req.params.id;
        try {
            await req.pool.query('DELETE FROM "Services" WHERE id = $1', [id]);
            res.json({ message: `Service with ID ${id} has been deleted successfully.` });
        } catch (error) {
            console.error('Error deleting service:', error);
            res.status(500).json({ message: 'Error deleting service' });
        }
    }
    
}

module.exports = new ServicesController()