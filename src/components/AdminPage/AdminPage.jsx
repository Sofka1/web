import React, { useState, useEffect } from 'react';
import style from './AdminPage.module.css';
import { useParams, useNavigate } from 'react-router-dom';

const AdminPage = () => {
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
    const [currentServicePage, setCurrentServicePage] = useState(1);
    const [showModal, setShowModal] = useState(false); // состояние для отображения модального окна
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [serviceSearchTerm, setServiceSearchTerm] = useState(''); // состояние для поиска услуг
    const [currentPage, setCurrentPage] = useState(1);
    const [services, setServices] = useState([]); // добавлено для хранения списка услуг
    const usersPerPage = 5;
    const navigate = useNavigate(); // Для перенаправления пользователя
    // Состояние для отображения модального окна и хранения id удаляемой услуги
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);
    const filteredServices = services.filter(service =>
        service.title.toLowerCase().includes(serviceSearchTerm.toLowerCase())
    );

    const handleServiceSearchChange = (e) => {
        setServiceSearchTerm(e.target.value);
    };

    const handleAddService = () => {
        // Логика для открытия формы добавления
    };

    const handleEditService = (serviceId) => {
        // Логика для редактирования услуги
    };

    const handleDeleteService = (serviceId) => {
        setServiceToDelete(serviceId);
        setShowDeleteModal(true);
    };

    // Обработчик для подтверждения удаления услуги
    const confirmDeleteService = async () => {
        if (serviceToDelete) {
            try {
                const response = await fetch(`http://localhost:8080/api/services/${serviceToDelete}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setServices(services.filter(service => service.id !== serviceToDelete));
                    console.log('Услуга успешно удалена');
                } else {
                    console.error('Ошибка при удалении услуги');
                }
            } catch (error) {
                console.error('Ошибка запроса:', error);
            } finally {
                // Закрываем модальное окно и сбрасываем состояние
                setShowDeleteModal(false);
                setServiceToDelete(null);
            }
        }
    };

    // Обработчик для закрытия модального окна
    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setServiceToDelete(null);
    };

    // Подгружаем пользователей и их данные о записях
    useEffect(() => {
        const fetchUsersData = async () => {
            try {
                // Загружаем список всех пользователей
                const usersResponse = await fetch('http://localhost:8080/api/user');
                const usersData = await usersResponse.json();

                if (usersResponse.ok) {
                    // Получаем записи для каждого пользователя
                    const usersWithAppointments = await Promise.all(
                        usersData.map(async (user) => {
                            const appointmentsResponse = await fetch(`http://localhost:8080/api/user/${user.id}/bookings`);
                            const appointmentsData = await appointmentsResponse.json();

                            // Фильтруем предстоящие записи
                            const upcomingAppointments = appointmentsData.filter(appointment => {
                                const appointmentDate = new Date(Date.parse(appointment.booking_date));
                                const currentDate = new Date();

                                // Сбрасываем время для корректного сравнения только по дате
                                appointmentDate.setHours(0, 0, 0, 0);
                                currentDate.setHours(0, 0, 0, 0);

                                return appointmentDate > currentDate; // Сравниваем только дату, без учета времени
                            });

                            return {
                                ...user,
                                upcomingAppointments,
                                totalServices: appointmentsData.length, // Общее количество записей (прошедших и предстоящих)
                            };
                        })
                    );

                    setUsers(usersWithAppointments); // Сохраняем обновленных пользователей с записями
                } else {
                    console.error('Ошибка загрузки списка пользователей:', usersData.message);
                }
            } catch (error) {
                console.error('Ошибка запроса:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsersData();
    }, []);

    // Подгружаем данные админа
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

    // useEffect для загрузки услуг
    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/getAllServices');
                const data = await response.json();

                if (response.ok) {
                    setServices(data); // Сохраняем список услуг в состоянии
                } else {
                    console.error('Ошибка загрузки списка услуг:', data.message);
                }
            } catch (error) {
                console.error('Ошибка при загрузке списка услуг:', error);
            }
        };

        fetchServices();
    }, []);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    // Функция для выхода пользователя
    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
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

    if (loading) {
        return <p>Загрузка...</p>; // Отображаем индикатор загрузки
    }

    if (!user) {
        return <p>Пользователь не найден</p>;
    }

    const servicesPerPage = 5;

    // Отфильтрованные услуги на текущей странице
    const indexOfLastService = currentServicePage * servicesPerPage;
    const indexOfFirstService = indexOfLastService - servicesPerPage;
    const currentServices = filteredServices.slice(indexOfFirstService, indexOfLastService);

    // Общее количество страниц для услуг
    const totalServicePages = Math.ceil(filteredServices.length / servicesPerPage);

    // Функция для перехода на следующую или предыдущую страницу услуг
    const handleServicePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalServicePages) {
            setCurrentServicePage(newPage);
        }
    };


    // Фильтрация пользователей на основе поискового запроса
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Определяем пользователей, которые должны быть показаны на текущей странице
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // Определяем количество страниц
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    // Функция для перехода на следующую или предыдущую страницу
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Обработчик изменения поиска
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Сбрасываем на первую страницу при поиске
    };

    const formatAppointmentDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `- ${day}.${month}.${year}`;
    };

    function formatAppointmentTime(time) {
        if (!time) return 'Нет времени';
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    }

    // Функция для удаления пользователя
    const deleteUser = async (userId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/user/${userId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Удаляем пользователя из состояния после успешного запроса
                setUsers(users.filter(user => user.id !== userId));
                console.log('Пользователь успешно удален');
            } else {
                const errorData = await response.json();
                console.error('Ошибка при удалении пользователя:', errorData.message);
            }
        } catch (error) {
            console.error('Ошибка запроса:', error);
        }
    };


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
                            className={`${style.menuItem} ${activeTab === 'users' ? style.active : ''}`}
                            onClick={() => handleTabClick('users')}
                        >
                            Список пользователей
                        </div>
                    </div>

                    <div className={style.decorLine}></div>

                    <div className={style.userMenuPoint}>
                        <div
                            className={`${style.menuItem} ${activeTab === 'services' ? style.active : ''}`}
                            onClick={() => handleTabClick('services')}
                        >
                            Список услуг
                        </div>
                    </div>

                    <div className={style.decorLine}></div>

                    <div className={style.userMenuPoint}>
                        <div
                            className={`${style.menuItem} ${activeTab === 'tests' ? style.active : ''}`}
                            onClick={() => handleTabClick('tests')}
                        >
                            Тесты
                        </div>
                    </div>

                    <div className={style.decorLine}></div>

                    <div className={style.userMenuPoint}>
                        <div
                            className={`${style.menuItem} ${activeTab === 'reviews' ? style.active : ''}`}
                            onClick={() => handleTabClick('reviews')}
                        >
                            Отзывы
                        </div>
                    </div>
                </div>

                {/* Контент, который меняется в зависимости от активной вкладки */}
                <div className={style.content}>
                    {/* Личная информация */}
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

                    {/* Список всех пользователей и их записи */}
                    {activeTab === 'users' && (
                        <div>
                            {/* шапка */}
                            <div className={style.headerUsers}>
                                <h2>Пользователи</h2>
                                <div className={style.searchUsers}>
                                    <img src={require('./image/icons/search.png')} />
                                    <input
                                        type="text"
                                        placeholder="Поиск"
                                        value={searchTerm}
                                        onChange={handleSearchChange}
                                        className={style.searchInput}
                                    />
                                </div>
                            </div>

                            {user ? (
                                <ul className={style.userList}>
                                    {currentUsers.map((user, index) => (
                                        <div className={style.userItem} key={user.id}>
                                            <div className={style.mainInfaUser}>
                                                {/* Индекс пользователя */}
                                                <div className={style.userIndexBackgroung}>
                                                    <span className={style.userIndex}>
                                                        {index + 1 + (currentPage - 1) * 5}
                                                    </span>
                                                </div>
                                                <div className={style.nameListUser}>
                                                    <span className={style.usersName}>{user.name} {user.surname}</span>
                                                </div>
                                            </div>

                                            <div className={style.decorLine2}></div>

                                            {/* Предстоящие записи */}
                                            {user.upcomingAppointments && user.upcomingAppointments.length > 0 ? (
                                                <div className={style.userUpcomingAppointments}>
                                                    <span>Предстоящие записи:</span>
                                                    <ul>
                                                        {user.upcomingAppointments.map((appointment, idx) => (
                                                            <li key={idx}>
                                                                {appointment.booking_date ? `${formatAppointmentTime(appointment.booking_time)} ${formatAppointmentDate(appointment.booking_date)}`
                                                                    : 'Нет даты'}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ) : (
                                                <div className={style.noUpcomingAppointments}>
                                                    <span>Нет предстоящих записей</span>
                                                </div>
                                            )}

                                            <div className={style.decorLine2}></div>


                                            {/* Общее количество услуг */}
                                            <div className={style.userTotalServices}>
                                                <p>Общее количество услуг: <span>{user.totalServices}</span></p>
                                            </div>

                                            <div className={style.decorLine2}></div>

                                            {/* Кнопка удаления пользователя */}
                                            <button onClick={() => deleteUser(user.id)} className={style.deleteUserButton}>
                                                <img src={require('./image/icons/trash.png')} />
                                            </button>
                                        </div>
                                    ))}
                                </ul>
                            ) : (
                                <div>Загрузка данных пользователя...</div> // Показать индикатор загрузки
                            )}
                            {/* переключалка */}
                            <div className={style.pagination}>
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                    &lt;
                                </button>
                                <span>{currentPage} из {totalPages}</span>
                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                    &gt;
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Список всех услуг */}
                    {activeTab === 'services' && (
                        <div>
                            {/* шапка */}
                            <div className={style.headerUsers}>
                                <h2>Пользователи</h2>
                                <div className={style.serviceSearchAndAdd}>
                                    <div className={style.searchUsers}>
                                        <img src={require('./image/icons/search.png')} />
                                        <input
                                            type="text"
                                            placeholder="Поиск"
                                            value={serviceSearchTerm}
                                            onChange={handleServiceSearchChange}
                                            className={style.searchInput}
                                        />
                                    </div>
                                    <button onClick={handleAddService} className={style.addServiceButton}>
                                        <img src={require('./image/icons/plus.png')} />
                                        Добавить услугу
                                    </button>
                                </div>
                            </div>

                            {/* Список услуг */}
                            <div className={style.serviceList}>
                                {currentServices.map((service, index) => (
                                    <div key={service.id} className={style.serviceItem}>
                                        <div className={style.serviceInfo}>
                                            {/* Индекс пользователя */}
                                            <div className={style.userIndexBackgroung}>
                                                <span className={style.serviceIndex}>
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <span className={style.serviceTitle}>{service.title}</span>
                                        </div>
                                        <div className={style.serviceActions}>
                                            <button onClick={() => handleEditService(service.id)} className={style.editServiceButton}>
                                                <img src={require('./image/icons/editWhite.png')} />
                                            </button>
                                            <button onClick={() => handleDeleteService(service.id)} className={style.deleteUserButton}>
                                                <img src={require('./image/icons/trash.png')} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className={style.pagination}>
                                    <button onClick={() => handleServicePageChange(currentServicePage - 1)} disabled={currentServicePage === 1}>&lt;</button>
                                    <span> {currentServicePage} из {totalServicePages}</span>
                                    <button onClick={() => handleServicePageChange(currentServicePage + 1)} disabled={currentServicePage === totalServicePages}>&gt;</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'tests' && (
                        <div>
                            {/* шапка */}
                            <div className={style.headerUsers}>
                                <h2>Список тестов</h2>
                                <div className={style.serviceSearchAndAdd}>
                                    <div className={style.searchUsers}>
                                        <img src={require('./image/icons/search.png')} />
                                        <input
                                            type="text"
                                            placeholder="Поиск"
                                            value={serviceSearchTerm}
                                            onChange={handleServiceSearchChange}
                                            className={style.searchInput}
                                        />
                                    </div>
                                    <button onClick={handleAddService} className={style.addServiceButton}>
                                        <img src={require('./image/icons/plus.png')} />
                                        Добавить тест
                                    </button>
                                </div>
                            </div>
                            <div className={style.testsList}>
                                <div className={style.oneTest}>
                                    <div className={style.infoTest}>
                                        {/* Индекс теста */}
                                        <div className={style.userIndexBackgroung}>
                                            <span className={style.serviceIndex}>
                                                1
                                            </span>
                                        </div>
                                        <div className={style.serviceTitle}>Test 1</div>
                                    </div>
                                    <div className={style.serviceActions}>
                                        <button className={style.editServiceButton}>
                                            <img src={require('./image/icons/editWhite.png')} />
                                        </button>
                                        <button className={style.deleteUserButton}>
                                            <img src={require('./image/icons/trash.png')} />
                                        </button>
                                    </div>
                                </div>
                                <div className={style.oneTest}>
                                    <div className={style.infoTest}>
                                        {/* Индекс теста */}
                                        <div className={style.userIndexBackgroung}>
                                            <span className={style.serviceIndex}>
                                                2
                                            </span>
                                        </div>
                                        <div className={style.serviceTitle}>Test 2</div>
                                    </div>
                                    <div className={style.serviceActions}>
                                        <button className={style.editServiceButton}>
                                            <img src={require('./image/icons/editWhite.png')} />
                                        </button>
                                        <button className={style.deleteUserButton}>
                                            <img src={require('./image/icons/trash.png')} />
                                        </button>
                                    </div>
                                </div>
                                <div className={style.oneTest}>
                                    <div className={style.infoTest}>
                                        {/* Индекс теста */}
                                        <div className={style.userIndexBackgroung}>
                                            <span className={style.serviceIndex}>
                                                3
                                            </span>
                                        </div>
                                        <div className={style.serviceTitle}>Test 3</div>
                                    </div>
                                    <div className={style.serviceActions}>
                                        <button className={style.editServiceButton}>
                                            <img src={require('./image/icons/editWhite.png')} />
                                        </button>
                                        <button className={style.deleteUserButton}>
                                            <img src={require('./image/icons/trash.png')} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div>
                            <h2>Отзывы</h2>
                            <p>Здесь будут отзывы пользователей</p>
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

            {showDeleteModal && (
                <div className={style.modalOverlay}>
                    <div className={style.modalContent}>
                        <h3>Вы уверены, что хотите удалить эту услугу?</h3>
                        <div className={style.modalActions}>
                            <button onClick={confirmDeleteService} className={style.deleteServiceButton}>Удалить</button>
                            <button onClick={closeDeleteModal}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );


};

export default AdminPage;
