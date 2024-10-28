import React, { useState, useEffect } from 'react';
import style from './UserPage.module.css';
import { useParams, useNavigate } from 'react-router-dom';

const UserPage = () => {
    const { id } = useParams(); // Получаем ID пользователя из URL
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Состояние для загрузки
    const [editName, setEditName] = useState(false);
    const [editSurname, setEditSurname] = useState(false);
    const [editPhone, setEditPhone] = useState(false);
    const [editEmail, setEditEmail] = useState(false);
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

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/user/${id}`);
                const data = await response.json();

                if (response.ok) {
                    setUser(data);
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
        localStorage.removeItem('user'); // Удаляем данные пользователя из localStorage
        navigate('/main'); // Перенаправляем на страницу авторизации
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


    if (loading) {
        return <p>Загрузка...</p>; // Отображаем индикатор загрузки
    }

    if (!user) {
        return <p>Пользователь не найден</p>;
    }

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
                            className={`${style.menuItem} ${activeTab === 'appointments' ? style.active : ''}`}
                            onClick={() => handleTabClick('appointments')}
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

                    {activeTab === 'appointments' && (
                        <div>
                            <h2>Мои записи</h2>
                            <p>Здесь будут отображены ваши записи.</p>
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
        </div>
    );
};

export default UserPage;
