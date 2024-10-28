import React, { useState, useEffect } from 'react';
import style from './Registration.module.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

// Импорт картинок
import img1 from '../imageForRegAndAuth/1.png';
import img2 from '../imageForRegAndAuth/2.png';

const Registration = () => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const [isTermsChecked, setIsTermsChecked] = useState(false);

    const showMessage = (message, type = 'error') => {
        if (type === 'error') {
            setErrorMessage(message);
            setTimeout(() => setErrorMessage(''), 3000);  // Убираем через 3 секунды
        } else if (type === 'success') {
            setSuccessMessage(message);
            setTimeout(() => setSuccessMessage(''), 3000);  // Убираем через 3 секунды
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleCheckboxChange = (e) => {
        setIsTermsChecked(e.target.checked);
    };

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    // const validatePassword = (password) => {
    //     var re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    //     return re.test(password);
    // }

    const handleSubmit = async (e) => {
        e.preventDefault();  // предотвращаем перезагрузку страницы

        if (!isTermsChecked) {
            showMessage("Вы должны согласиться с условиями и политикой конфиденциальности.");
            return;
        }

        // Basic validation
        if (!formData.name.trim()) {
            showMessage("Введите имя");
            return;
        }
        if (!formData.surname.trim()) {
            showMessage("Введите фамилию.");
            return;
        }
        if (!formData.email.includes("@") || !validateEmail(formData.email)) {
            showMessage("Введите корректный email.");
            return;
        }
        if (formData.password.length < 6) {
            showMessage("Пароль должен быть не менее 6 символов.");
            return;
        }
        // if(!validatePassword(formData.password)){
        //     showMessage("Слишком легкий пароль");
        //     return;
        // }
        if (formData.password !== formData.confirmPassword) {
            showMessage("Пароли не совпадают.");
            return;
        }

        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await fetch('http://localhost:8080/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка сервера');
            }

            const data = await response.json();

            if (data && data.id) {
                showMessage("Регистрация прошла успешно!", 'success');

                localStorage.setItem('user', JSON.stringify({
                    id: data.user.id,
                    name: data.user.name,
                    surname: data.user.surname, // Фамилия
                    email: data.user.email,     // Почта
                    phone: data.user.phone      // Телефон
                }));

                window.dispatchEvent(new Event("storage"));

                setTimeout(() => {
                    navigate('/main');
                }, 2000);
            } else {
                showMessage('Ошибка регистрации: данные пользователя отсутствуют');
            }
        } catch (error) {
            showMessage(`Ошибка регистрации: ${error.message}`);
            console.error('Ошибка регистрации:', error);
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

            {errorMessage && (
                <div className={style.errorMes}>
                    {errorMessage}
                </div>
            )}
            {successMessage && (
                <div className={style.successMes}>
                    {successMessage}
                </div>
            )}

            <div className={style.imageRegAndAuth}>
                <img src={randomImage} alt="Registration Illustration" />
            </div>

            <div className={style.formContainer}>
                <div className={style.title}>
                    <h2>Регистрация</h2>
                    <div className={style.titleLine}></div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={style.inputGroup}>
                        <div className={style.inputFormWithTitle}>
                            <h6>Имя</h6>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className={style.inputFormWithTitle}>
                            <h6>Фамилия</h6>
                            <input
                                type="text"
                                name="surname"
                                value={formData.surname}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={style.inputGroup}>

                        <div className={style.inputFormWithTitle}>
                            <h6>Телефон</h6>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

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

                    <div className={style.inputGroupPassword}>
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
                        <div className={style.inputFormWithTitle2}>
                            <h6>Повторите пароль</h6>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>

                    <div className={style.terms}>
                        <input
                            className={style.termsCheckBox}
                            type="checkbox"
                            id="terms"
                            checked={isTermsChecked}
                            onChange={handleCheckboxChange}
                        />
                        <label htmlFor="terms">
                            Я согласен со всеми <Link>условиями</Link> и <Link>политикой конфиденциальности</Link>
                        </label>
                    </div>

                    <button type="submit" className={style.registerButton}>Регистрация</button>

                    <p className={style.alreadyHaveAccount}>
                        У вас уже есть аккаунт? <Link to="/login">Войти</Link>
                    </p>


                </form>

            </div>
        </div>
    );
};

export default Registration;
