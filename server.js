const express = require('express');
const path = require('path'); // Для работы со статическими файлами
const cors = require('cors');
const fileUpload = require('express-fileupload');
const pool = require('./db');

const userRouter = require('./routes/user.routes');
const servicesRoutes = require('./routes/services.routes');
const bookingRoutes = require('./routes/booking.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const reviewsRouter = require('./routes/reviews.router');
const articlesRouter = require('./routes/articles.routes');
const favoriteRouter = require('./routes/favorites.routes'); 

const PORT = process.env.PORT || 8080;
const app = express();

// Передаем pool в req для всех роутов
app.use((req, res, next) => {
    req.pool = pool;
    next();
});

app.use(fileUpload());
app.use(cors());
app.use(express.json());

// Роуты для API
app.use('/api', userRouter);
app.use('/api', servicesRoutes);
app.use('/api', bookingRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', reviewsRouter);
app.use('/api', articlesRouter);
app.use('/api', favoriteRouter);

// Если ты находишься в production, то сервер будет отдавать файлы React-приложения
if (process.env.NODE_ENV === 'production') {
    // Указываем путь к статическим файлам (которые будут созданы после сборки React-приложения)
    app.use(express.static(path.join(__dirname, 'build')));

    // Все пути, которые не начинаются с '/api', будут перенаправлены на index.html
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
} else {
    // Для разработки можно вернуть сообщение, если фронтенд не найден
    app.get('/', (req, res) => {
        res.send('API server is running...');
    });
}

// Запуск сервера
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
