const Router = require('express');
const router = new Router();
const FavoritesControllers = require('../controllers/favorites.controllers');

// Обработка добавления в избранное
router.post('/favorites', FavoritesControllers.addToFavorites);

// Обработка удаления из избранного
router.delete('/favorites', FavoritesControllers.removeFromFavorites);

router.get('/favoritesAll', FavoritesControllers.getAllFavorite);

// Получение всех статей, добавленных в избранное текущего пользователя
router.get('/favorites', FavoritesControllers.getUserFavorites);

// Проверка, находится ли статья в избранном
router.post('/favorites/check', FavoritesControllers.checkFavoriteStatus);

module.exports = router;   