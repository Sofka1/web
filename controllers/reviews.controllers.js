class ReviewsController {
    async addReview(req, res) {
        const { service_id, user_id, rating, comment } = req.body;

        try {
            const created_at = new Date();
            const result = await req.pool.query(
                'INSERT INTO "Reviews" (service_id, user_id, rating, comment, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [service_id, user_id, rating, comment, created_at]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error adding review:', error);
            res.status(500).json({ message: 'Error adding review' });
        }
    }

    async deleteReview(req, res) {
        const { id } = req.params;

        try {
            const result = await req.pool.query('DELETE FROM "Reviews" WHERE id = $1 RETURNING *', [id]);

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Review not found' });
            }

            res.status(200).json({ message: 'Review deleted successfully!' });
        } catch (error) {
            console.error('Error deleting review:', error);
            res.status(500).json({ message: 'Error deleting review' });
        }
    }

    async getAllReviews(req, res) {
        try {
            // Получаем все отзывы из базы данных
            const reviews = await req.pool.query('SELECT * FROM "Reviews"');
            res.json(reviews.rows);
        } catch (error) {
            console.error('Ошибка при получении отзывов:', error);
            res.status(500).json({ message: 'Ошибка сервера при загрузке отзывов' });
        }
    }

    async getRecentReviews(req, res) {
        try {
            const query = `
                SELECT r.id, r.rating, r.comment, r.created_at, u.name, u."userImage" AS avatar
                FROM "Reviews" r
                JOIN "Users" u ON r.user_id = u.id
                ORDER BY r.created_at DESC
                LIMIT 3;
            `;

            const reviews = await req.pool.query(query);
            res.json(reviews.rows);
        } catch (error) {
            console.error('Ошибка при получении отзывов:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    };

    // reviews.controller.js
    async getReviewsByServiceId(req, res) {
        try {
            const { service_id } = req.params;
            const query = `
            SELECT r.id, r.rating, r.comment, r.created_at, u.name, u."userImage" AS avatar
            FROM "Reviews" r
            JOIN "Users" u ON r.user_id = u.id
            WHERE r.service_id = $1
            ORDER BY r.created_at DESC;
        `;

            const result = await req.pool.query(query, [service_id]);
            res.json(result.rows);
        } catch (error) {
            console.error('Ошибка при получении отзывов для услуги:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    };

}

module.exports = new ReviewsController(); 