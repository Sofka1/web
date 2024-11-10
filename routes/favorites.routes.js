const Router = require('express');
const router = new Router();
const FavoritesControllers = require('../controllers/favorites.controllers');

// Обработка добавления в избранное
router.post('/favorites', FavoritesControllers.addToFavorites);

// Обработка удаления из избранного
router.delete('/favorites', FavoritesControllers.removeFromFavorites);

router.get('/favorites', FavoritesControllers.getAllFavorite);

module.exports = router;   