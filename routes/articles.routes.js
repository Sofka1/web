const Router = require('express');
const router = new Router();
const ArticlesControllers = require('../controllers/articles.controllers');

// Маршрут для добавления статьи
router.post('/articles/add', ArticlesControllers.addArticle);

// Маршрут для получения всех статей
router.get('/articles/all', ArticlesControllers.getAllArticles);

// Маршрут для получения статьи по ID
router.get('/articles/:id', ArticlesControllers.getArticleById);

// Маршрут для удаления статьи по ID
router.delete('/articles/:id', ArticlesControllers.deleteArticle); 

module.exports = router;   