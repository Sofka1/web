import React, { useState, useEffect } from 'react';
import style from './Login.module.css';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate вместо useHistory

// Импорт картинок
import img1 from '../imageForRegAndAuth/1.png';
import img2 from '../imageForRegAndAuth/2.png';
// import img3 from '../imageForRegAndAuth/3.png';
// import img4 from '../imageForRegAndAuth/4.png';
// import img5 from '../imageForRegAndAuth/5.png';
// import img6 from '../imageForRegAndAuth/6.png';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errorMessage, setErrorMessage] = useState(''); // Для вывода ошибок
    const navigate = useNavigate(); // Для перенаправления после входа

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('Отправка данных на сервер:', formData); // Лог для проверки отправляемых данных

        // Отправка данных на сервер
        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            console.log('Ответ от сервера:', data); // Лог для проверки ответа от сервера

            if (response.ok) {
                // После успешной авторизации или регистрации сохраняем все данные пользователя
                localStorage.setItem('user', JSON.stringify({
                    id: data.user.id,
                    name: data.user.name,
                    surname: data.user.surname, // Фамилия
                    email: data.user.email,     // Почта
                    phone: data.user.phone,      // Телефон
                    role: data.user.role 
                }));

                // Загружаем избранные статьи пользователя (если есть API для получения избранных)
                try {
                    const response = await fetch(`http://localhost:8080/api/favorites?user_id=${data.user.id}`);
                    const favoriteArticles = await response.json();
                    const favoriteArticleIds = favoriteArticles.map((article) => article.article_id);

                    // Сохраняем избранные статьи в localStorage
                    localStorage.setItem('favoriteArticles', JSON.stringify(favoriteArticleIds));
                } catch (error) {
                    console.error("Ошибка при загрузке избранных статей", error);
                }

                // Очищаем ошибки
                setErrorMessage('');
                window.dispatchEvent(new Event("storage")); // Это событие вызовет обновление в других компонентах, использующих данные из localStorage

                // Перенаправляем на главную страницу
                navigate('/main');
            } else {
                // Если ошибка, выводим сообщение
                setErrorMessage(data.message || 'Ошибка при авторизации');
                console.log('Ошибка при авторизации:', data.message);
            }
        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            setErrorMessage('Произошла ошибка. Попробуйте еще раз.');
        }
    };

    // Состояние для хранения случайно выбранной картинки
    const [randomImage, setRandomImage] = useState('');

    useEffect(() => {
        // Генерация случайного числа от 0 до 1
        const randomIndex = Math.floor(Math.random() * 2); // Генерируем 0 или 1

        // В зависимости от числа выбираем картинку
        if (randomIndex === 0) {
            setRandomImage(img1);
        } else {
            setRandomImage(img2);
        }
    }, []); // Пустой массив зависимостей, чтобы это сработало только при первой загрузке страницы

    return (
        <div className={style.container}>
            <div className={style.imageRegAndAuth}>
                <img src={randomImage} alt="Login Illustration" />
            </div>

            <div className={style.formContainer}>
                <div className={style.title}>
                    <h2>Авторизация</h2>
                    <div className={style.titleLine}></div>
                </div>

                {errorMessage && <p className={style.error}>{errorMessage}</p>} {/* Отображение ошибки */}

                <form onSubmit={handleSubmit}>
                    <div className={style.inputGroup}>
                        <div className={style.inputFormWithTitle}>
                            <h6>Почта</h6>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={style.inputGroup}>
                        <div className={style.inputFormWithTitle}>
                            <h6>Пароль</h6>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={style.terms}>
                        <div className={style.rememberMe}>
                            <input className={style.termsCheckBox} type="checkbox" id="terms" />
                            <label htmlFor="terms">Запомнить меня</label>
                        </div>
                        <Link>Забыли пароль?</Link>
                    </div>

                    <button type="submit" className={style.registerButton}>Вход</button>
                </form>

                <p className={style.alreadyHaveAccount}>
                    Ещё нет аккаунта? <Link to="/registration">Регистрация</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
