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
}

module.exports = new ReviewsController();