const FavoritesControllers = {
    async addToFavorites(req, res) {
        console.log('Received body for adding:', req.body);

        const { article_id, user_id } = req.body;
        try {
            if (!article_id || !user_id) {
                return res.status(400).json({ message: 'Недостаточно данных для добавления в избранное' });
            }

            const query = 'INSERT INTO "Favorites" (user_id, article_id) VALUES ($1, $2)';
            await req.pool.query(query, [user_id, article_id]);

            res.status(200).json({ message: 'Статья добавлена в избранное' });
        } catch (error) {
            console.error('Ошибка при добавлении статьи в избранное:', error);
            res.status(500).json({ message: 'Ошибка при добавлении статьи в избранное' });
        }
    },

    async removeFromFavorites(req, res) {
        console.log('Received body for removal:', req.body);

        const { article_id, user_id } = req.body;

        try {
            if (!article_id || !user_id) {
                return res.status(400).json({ message: 'Недостаточно данных для удаления из избранного' });
            }

            const query = `DELETE FROM "Favorites" WHERE user_id = $1 AND article_id = $2 RETURNING *`;
            const result = await req.pool.query(query, [user_id, article_id]);

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Запись не найдена в избранном' });
            }

            res.status(200).json({ message: 'Статья удалена из избранного' });
        } catch (error) {
            console.error('Ошибка при удалении из избранного:', error);
            res.status(500).json({ message: 'Ошибка при удалении из избранного' });
        }
    },

    async getAllFavorite(req, res) {
        try {
            const favorite = await req.pool.query('SELECT * FROM "Favorites"');
            res.json(favorite.rows);
        } catch (error) {
            console.error('Ошибка при получении списка избранных:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = FavoritesControllers;