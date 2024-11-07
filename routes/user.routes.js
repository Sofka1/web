const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controllers');
const multer = require('multer');

// Настройка multer для загрузки аватара
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/avatars');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.get('/user/:id/bookings', userController.getUserBookings);
router.post('/user', userController.createUser)
router.post('/login', userController.loginUser)
router.get('/user', userController.getUsers)
router.get('/user/:id', userController.getOneUser)
router.put('/user/:id', userController.updateUser)
router.delete('/user/:id', userController.deleteUser)

// Роут для загрузки аватара
router.put('/user/:id/avatar', upload.single('file'), userController.uploadAvatar);

// Маршрут для загрузки фоновой картинки
router.put('/user/:id/cover', userController.uploadCover);

module.exports = router;