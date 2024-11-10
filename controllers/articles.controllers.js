const ArticlesController = {
    // Добавление новой статьи
    async addArticle(req, res) {
        const { title, content } = req.body;
        const created_at = new Date();
   
        try {
            const query = `
                INSERT INTO "Articles" (title, content, created_at)
                VALUES ($1, $2, $3) RETURNING *;
            `;
            const values = [title, content, created_at];
            const result = await req.pool.query(query, values);

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Ошибка при добавлении статьи:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    },

    // Получение всех статей
    async getAllArticles(req, res) {
        try {
            const query = 'SELECT * FROM "Articles" ORDER BY created_at DESC;';
            const result = await req.pool.query(query);
            res.json(result.rows);
        } catch (error) {
            console.error('Ошибка при получении всех статей:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    },

    // Получение статьи по ID
    async getArticleById(req, res) {
        const { id } = req.params;

        try {
            const query = 'SELECT * FROM "Articles" WHERE id = $1;';
            const result = await req.pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Статья не найдена' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Ошибка при получении статьи по ID:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    },

    // Удаление статьи по ID
    async deleteArticle(req, res) {
        const { id } = req.params;

        try {
            const query = 'DELETE FROM "Articles" WHERE id = $1 RETURNING *;';
            const result = await req.pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Статья не найдена' });
            }

            res.json({ message: 'Статья успешно удалена', deletedArticle: result.rows[0] });
        } catch (error) {
            console.error('Ошибка при удалении статьи:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
};

module.exports = ArticlesController;
