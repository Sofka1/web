import React, { useState, useEffect } from 'react';
import style from './UserPage.module.css';
import { useParams, useNavigate } from 'react-router-dom';

const UserPage = () => {
    const { id } = useParams(); // Получаем ID пользователя из URL
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Состояние для загрузки
    const defaultAvatar = require('./image/defaultAvatar.png'); // Укажите путь к вашему дефолтному фото
    const defaultCover = require('./image/icons/share.png');
    const [activeTab, setActiveTab] = useState('account'); // Состояние для активной вкладки
    const [userData, setUserData] = useState({
        name: '',
        surname: '',
        phone: '',
        email: ''
    });
    const [editMode, setEditMode] = useState({
        name: false,
        surname: false,
        phone: false,
        email: false,
    });
    const navigate = useNavigate(); // Для перенаправления пользователя
    const [showModal, setShowModal] = useState(false); // состояние для отображения модального окна

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/user/${id}`);
                const data = await response.json();

                if (response.ok) {
                    setUser(data);
                    // Загружаем услуги пользователя
                    const servicesResponse = await fetch(`http://localhost:8080/api/user/${id}/bookings`);
                    const servicesData = await servicesResponse.json();
                    if (servicesResponse.ok) {
                        setUser((prevUser) => ({
                            ...prevUser,
                            services: servicesData,
                        }));
                    } else {
                        console.error('Ошибка загрузки услуг:', servicesData.message);
                    }
                } else {
                    console.error('Ошибка загрузки данных пользователя:', data.message);
                }
            } catch (error) {
                console.error('Ошибка запроса:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id]);


    // Загрузка данных пользователя из localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserData({
                name: parsedUser.name || '',
                surname: parsedUser.surname || '',
                phone: parsedUser.phone || '',
                email: parsedUser.email || ''
            });
        }
    }, []);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    // Функция для выхода пользователя
    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        // setIsAdmin(false);
        navigate('/main');
        window.location.reload(); // Перезагружает страницу, чтобы обновить интерфейс
    };

    // Функция для удаления аккаунта
    const handleDeleteAccount = async () => {
        const user = JSON.parse(localStorage.getItem('user')); // Получаем данные пользователя
        if (!user || !user.id) return; // Проверяем, что id пользователя существует

        try {
            const response = await fetch(`http://localhost:8080/api/user/${user.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                localStorage.removeItem('user'); // Удаляем данные из localStorage
                alert('Ваш аккаунт был успешно удален');
                navigate('/registration'); // Перенаправляем на страницу регистрации
            } else {
                alert('Произошла ошибка при удалении аккаунта');
            }
        } catch (error) {
            console.error('Ошибка при удалении аккаунта:', error);
        }
    };

    // Обработчик изменения значений в полях формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    // Функция для сохранения данных пользователя
    const handleSave = async (fieldName) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) return;

        try {
            const response = await fetch(`http://localhost:8080/api/user/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [fieldName]: userData[fieldName] }),
            });

            if (response.ok) {
                const updatedUser = { ...user, [fieldName]: userData[fieldName] };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                alert('Данные успешно обновлены!');
                setEditMode((prevState) => ({ ...prevState, [fieldName]: false }));
            } else {
                const data = await response.json();
                alert(`Ошибка при обновлении данных: ${data.message}`);
            }
        } catch (error) {
            console.error('Ошибка при обновлении данных:', error);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('avatar', file);

            try {
                const response = await fetch(`http://localhost:8080/api/user/${user.id}/avatar`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Аватар обновлен:', data);
                    // Обновляем localStorage и состояние пользователя с новым аватаром
                } else {
                    alert('Ошибка при загрузке аватара');
                }
            } catch (error) {
                console.error('Ошибка при загрузке аватара:', error);
            }
        }
    };

    const handleCoverChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('cover', file);

            try {
                const response = await fetch(`http://localhost:8080/api/user/${user.id}/cover`, {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('Фон обновлен:', data);
                    // Обновляем localStorage и состояние пользователя с новым фоном
                } else {
                    alert('Ошибка при загрузке фона');
                }
            } catch (error) {
                console.error('Ошибка при загрузке фона:', error);
            }
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            // Отправляем запрос на сервер для отмены записи
            const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Обновляем список услуг после отмены записи
                setUser((prevUser) => ({
                    ...prevUser,
                    services: prevUser.services.filter(service => service.id !== bookingId)
                }));
                setShowModal(true);
                // Устанавливаем таймер для перезагрузки страницы
                setTimeout(() => {
                    window.location.reload();
                }, 3000); // Задержка в 3 секунды (3000 миллисекунд)
            } else {
                const data = await response.json();
                alert(`Ошибка при отмене записи: ${data.message}`);
            }
        } catch (error) {
            console.error('Ошибка при отмене записи:', error);
            alert('Произошла ошибка при отмене записи');
        }
    };

    if (loading) {
        return <p>Загрузка...</p>; // Отображаем индикатор загрузки
    }

    if (!user) {
        return <p>Пользователь не найден</p>;
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        // Получаем день, месяц и год
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const formatTime = (timeString) => {
        // Время уже в формате 'HH:MM', так что можно использовать его напрямую
        return timeString.slice(0, 5);
    };

    const currentDate = new Date();

    // Проверка наличия данных перед фильтрацией
    const upcomingServices = user.services ? user.services.filter(service => new Date(service.booking_date) >= currentDate) : [];
    const pastServices = user.services ? user.services.filter(service => new Date(service.booking_date) < currentDate) : [];

    return (
        <div className={style.container}>
            <div className={style.headerUserPage}>
                {/* Фон с кнопкой */}
                <div className={style.backgroundUser}>
                    <button onClick={() => document.getElementById('coverUpload').click()}>
                        <img src={defaultCover} alt="Изменить фон" />
                        <p>Изменить фон</p>
                    </button>
                    <input
                        type="file"
                        id="coverUpload"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleCoverChange}
                    />
                </div>

                {/* Основная информация с фоткой, именем и почтой */}
                <div className={style.userInfo}>
                    <div className={style.userImage}>
                        <button onClick={() => document.getElementById('avatarUpload').click()}>
                            <img src={require('./image/icons/change.png')} alt="Изменить аватар" />
                        </button>
                        <input
                            type="file"
                            id="avatarUpload"
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleAvatarChange}
                        />
                        <div className={style.fotoUser}>
                            <img src={user.userImage ? user.userImage : defaultAvatar} />
                        </div>
                    </div>

                    <div className={style.userName}>
                        <h3>{user.name}</h3>
                        <p>{user.email}</p>
                    </div>
                </div>

            </div>

            <div className={style.userPage}>

                {/* Меню с вкладками */}
                <div className={style.userMenu}>
                    <div className={style.userMenuPoint}>
                        <div
                            className={`${style.menuItem} ${activeTab === 'account' ? style.active : ''}`}
                            onClick={() => handleTabClick('account')}
                        >
                            Данные аккаунта
                        </div>
                    </div>

                    <div className={style.decorLine}></div>

                    <div className={style.userMenuPoint}>
                        <div
                            className={`${style.menuItem} ${activeTab === 'services' ? style.active : ''}`}
                            onClick={() => handleTabClick('services')}
                        >
                            Мои записи
                        </div>
                    </div>

                    <div className={style.decorLine}></div>

                    <div className={style.userMenuPoint}>
                        <div
                            className={`${style.menuItem} ${activeTab === 'articles' ? style.active : ''}`}
                            onClick={() => handleTabClick('articles')}
                        >
                            Сохраненные статьи
                        </div>
                    </div>
                </div>

                {/* Контент, который меняется в зависимости от активной вкладки */}
                <div className={style.content}>
                    {activeTab === 'account' && (
                        <div>
                            <h2>Данные аккаунта</h2>

                            <div className={style.userInputForInfo}>
                                <div className={style.formGroup}>
                                    <label>Имя:</label>
                                    <div className={style.inputForm}>
                                        <input
                                            type="text"
                                            name="name"
                                            value={userData.name}
                                            onChange={handleChange}
                                            disabled={!editMode.name} // Активируем редактирование только если editMode.name = true
                                        />
                                        <button
                                            onClick={() => {
                                                if (editMode.name) {
                                                    handleSave('name'); // Сохраняем данные
                                                } else {
                                                    setEditMode((prevState) => ({ ...prevState, name: true })); // Включаем режим редактирования
                                                }
                                            }}
                                        >
                                            <img src={require('./image/icons/edit.png')} />
                                            {editMode.name ? 'Сохранить' : 'Изменить'}
                                        </button>
                                    </div>
                                </div>

                                <div className={style.formGroup}>
                                    <label>Фамилия:</label>
                                    <div className={style.inputForm}>
                                        <input
                                            type="text"
                                            name="surname"
                                            value={userData.surname}
                                            onChange={handleChange}
                                            disabled={!editMode.surname}
                                        />
                                        <button
                                            onClick={() => {
                                                if (editMode.surname) {
                                                    handleSave('surname');
                                                } else {
                                                    setEditMode((prevState) => ({ ...prevState, surname: true }));
                                                }
                                            }}
                                        >
                                            <img src={require('./image/icons/edit.png')} />
                                            {editMode.surname ? 'Сохранить' : 'Изменить'}
                                        </button>
                                    </div>
                                </div>

                                <div className={style.formGroup}>
                                    <label>Телефон:</label>
                                    <div className={style.inputForm}>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={userData.phone}
                                            onChange={handleChange}
                                            disabled={!editMode.phone}
                                        />
                                        <button
                                            onClick={() => {
                                                if (editMode.phone) {
                                                    handleSave('phone');
                                                } else {
                                                    setEditMode((prevState) => ({ ...prevState, phone: true }));
                                                }
                                            }}
                                        >
                                            <img src={require('./image/icons/edit.png')} />
                                            {editMode.phone ? 'Сохранить' : 'Изменить'}
                                        </button>
                                    </div>
                                </div>

                                <div className={style.formGroup}>
                                    <label>Email:</label>
                                    <div className={style.inputForm}>
                                        <input
                                            type="email"
                                            name="email"
                                            value={userData.email}
                                            onChange={handleChange}
                                            disabled={!editMode.email}
                                        />
                                        <button
                                            onClick={() => {
                                                if (editMode.email) {
                                                    handleSave('email');
                                                } else {
                                                    setEditMode((prevState) => ({ ...prevState, email: true }));
                                                }
                                            }}
                                        >
                                            <img src={require('./image/icons/edit.png')} />
                                            {editMode.email ? 'Сохранить' : 'Изменить'}
                                        </button>
                                    </div>
                                </div>

                            </div>

                            <div className={style.optionButton}>
                                <button className={style.logoutButton} onClick={handleLogout}>
                                    Выйти
                                </button>
                                <button className={style.deleteButton} onClick={handleDeleteAccount}>
                                    Удалить аккаунт
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div>
                            <div className={style.UpcomingServices}>
                                <h2>Предстоящие</h2>
                                {upcomingServices.length > 0 ? (
                                    <div className={style.serviceList}>
                                        {upcomingServices.map(service => (
                                            <div className={style.serviceCard}>
                                                <div key={service.booking_id}>
                                                    {/* Отображение данных услуги */}
                                                    <h3>{service.service_title}</h3>
                                                    <div className={style.serviceDate}>
                                                        <img src={require('./image/icons/calendar.png')} alt="" />
                                                        <p>{formatDate(service.booking_date)} - {formatTime(service.booking_time)}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <button onClick={() => handleCancelBooking(service.booking_id)} className={style.deleteService}>
                                                        Отменить запись
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Нет предстоящих записей</p>
                                )}
                            </div>
                            <div className={style.pastServices}>
                                <h2>Прошедшие</h2>
                                {pastServices.length > 0 ? (
                                    <div className={style.serviceList}>
                                        {pastServices.map(service => (
                                            <div className={style.serviceCard}>
                                                <div key={service.booking_id}>
                                                    {/* Отображение данных услуги */}
                                                    <h3>{service.service_title}</h3>
                                                    <div className={style.serviceDate}>
                                                        <img src={require('./image/icons/calendar.png')} />
                                                        <p>{formatDate(service.booking_date)} - {formatTime(service.booking_time)}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <button className={style.reviewsService}>
                                                        <img src={require('./image/icons/message.png')} />
                                                        Оставить отзыв
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>Нет прошедших записей</p>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'articles' && (
                        <div>
                            <h2>Сохраненные статьи</h2>
                            <p>Здесь будут отображены ваши сохраненные статьи.</p>
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className={style.modal}>
                    <div className={style.modalContent}>
                        <button className={style.closeButton} onClick={() => setShowModal(false)}>✖</button>
                        <h2>Запись успешно отменена</h2>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserPage;
