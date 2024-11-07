const db = require('../db');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// Настраиваем место для сохранения файлов и их имена
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

class UserController {

    async createUser(req, res) {
        const { name, surname, email, phone, password } = req.body;
        const defaultRole = "User";

        try {
            const userExists = await req.pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);
            if (userExists.rows.length > 0) {
                return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await req.pool.query(
                'INSERT INTO "Users" ("name", "surname", "email", "phone", "password", "role") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [name, surname, email, phone, hashedPassword, defaultRole]
            );
            res.json(newUser.rows[0]);
        } catch (error) {
            console.error('Ошибка при создании пользователя:', error);
            res.status(500).json({ message: 'Ошибка при создании пользователя' });
        }
    }

    async loginUser(req, res) {
        const { email, password } = req.body;
        try {
            const user = await req.pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);
            if (user.rows.length === 0) {
                return res.status(400).json({ message: 'Пользователь не найден' });
            }

            const validPassword = await bcrypt.compare(password, user.rows[0].password);
            if (!validPassword) {
                return res.status(400).json({ message: 'Неправильный пароль' });
            }

            res.json({ message: 'Вход успешен', user: user.rows[0] });
        } catch (error) {
            console.error('Ошибка при авторизации:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getUsers(req, res) {
        try {
            const users = await req.pool.query('SELECT * FROM "Users"');
            res.json(users.rows);
        } catch (error) {
            console.error('Ошибка при получении списка пользователей:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async getOneUser(req, res) {
        const id = req.params.id
        const user = await db.query('SELECT * FROM "Users" where id = $1', [id])
        res.json(user.rows[0])
    }

    async updateUser(req, res) {
        const id = req.params.id;
        const { name, surname, email, phone, password } = req.body;
        try {
            const currentUser = await req.pool.query('SELECT * FROM "Users" WHERE id = $1', [id]);
            if (currentUser.rows.length === 0) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
            const existingUser = currentUser.rows[0];
            const updatedPassword = password ? await bcrypt.hash(password, 10) : existingUser.password;
            const user = await req.pool.query(
                'UPDATE "Users" SET name = $1, surname = $2, email = $3, phone = $4, password = $5 WHERE id = $6 RETURNING *',
                [name || existingUser.name, surname || existingUser.surname, email || existingUser.email, phone || existingUser.phone, updatedPassword, id]
            );
            res.json(user.rows[0]);
        } catch (error) {
            console.error('Ошибка при обновлении пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async deleteUser(req, res) {
        const id = req.params.id;
        try {
            const deleteResult = await req.pool.query('DELETE FROM "Users" WHERE id = $1 RETURNING *', [id]);
            if (deleteResult.rows.length === 0) {
                return res.status(404).json({ message: 'Пользователь не найден' });
            }
            res.json({ message: `Пользователь с ID ${id} был удален` });
        } catch (error) {
            console.error('Ошибка при удалении пользователя:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async uploadAvatar(req, res) {
        try {
            const userId = req.params.id;
            const file = req.file;
            if (!file) {
                return res.status(400).json({ message: 'Файл не загружен' });
            }
            const avatarPath = `../uploads/avatars/${file.filename}`;
            const result = await req.pool.query(
                'UPDATE "Users" SET avatar = $1 WHERE id = $2 RETURNING *',
                [avatarPath, userId]
            );
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Ошибка при загрузке аватара:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    async uploadCover(req, res) {
        try {
            const userId = req.params.id;
            const { file } = req.files;
            if (!file) {
                return res.status(400).json({ message: 'Файл не загружен' });
            }
            const coverPath = `../uploads/covers/${file.name}`;
            const savePath = path.join(__dirname, '../', coverPath);
            file.mv(savePath, async (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Ошибка при сохранении файла' });
                }
                const result = await req.pool.query(
                    'UPDATE "Users" SET cover = $1 WHERE id = $2 RETURNING *',
                    [coverPath, userId]
                );
                res.json(result.rows[0]);
            });
        } catch (error) {
            console.error('Ошибка при загрузке фоновой картинки:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }

    // Метод для получения всех записей пользователя
    async getUserBookings(req, res) {
        const { id } = req.params; // Извлекаем id пользователя из параметров запроса

        try {
            // Выполняем запрос к базе данных для получения записей
            const userBookings = await req.pool.query(
                `SELECT 
                    b.id AS booking_id, 
                    s.title AS service_title, 
                    s.description AS service_description, 
                    b.booking_date, 
                    b.booking_time
                FROM "Bookings" b
                JOIN "Services" s ON b.service_id = s.id
                WHERE b.user_id = $1`,
                [id]
            );

            // Возвращаем записи пользователя
            res.json(userBookings.rows);
        } catch (error) {
            console.error('Ошибка при получении записей пользователя:', error);
            res.status(500).json({ message: 'Ошибка при получении записей пользователя' });
        }
    }
}

module.exports = new UserController()