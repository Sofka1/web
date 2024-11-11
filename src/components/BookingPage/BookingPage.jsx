import React, { useEffect, useState } from 'react';
import style from './BookingPage.module.css';
import { useParams, Link } from 'react-router-dom';
import { fetchServices } from '../../ServicesData';

const Calendar = ({ selectedDate, onDateClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysOfWeek = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const isWeekend = (day) => {
        const date = new Date(year, month, day);
        return date.getDay() === 0 || date.getDay() === 6; 
    };

    const isPastDate = (day) => {
        const date = new Date(year, month, day);
        return date < new Date();
    };

    const handleDateClick = (day) => {
        const date = new Date(year, month, day);
        if (!isPastDate(day)) {
            onDateClick(date);
        }
    };

    return (
        <div className={style.calendar}>
            <div className={style.calendarHeader}>
                <button onClick={handlePrevMonth}>
                    <img src={require('./icons/left.png')} alt="Previous" />
                </button>
                <h2>{`${monthNames[month]} ${year}`}</h2>
                <button onClick={handleNextMonth}>
                    <img src={require('./icons/right.png')} alt="Next" />
                </button>
            </div>
            <div className={style.daysOfWeek}>
                {daysOfWeek.map((day, index) => (
                    <div key={index} className={style.dayHeader}>
                        {day}
                    </div>
                ))}
            </div>
            <div className={style.days}>
                {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map((_, index) => (
                    <div key={index} className={style.emptyDay} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, day) => {
                    const dayNum = day + 1;
                    const isActive = dayNum === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
                    const isWeekendDay = isWeekend(dayNum);
                    const isPast = isPastDate(dayNum);

                    return (
                        <div
                            key={dayNum}
                            onClick={() => handleDateClick(dayNum)}
                            className={`${style.day} 
                            ${isActive ? style.active : ''} 
                            ${isWeekendDay ? style.weekend : style.weekday} 
                            ${isPast ? style.past : ''}`}
                            style={{ pointerEvents: isPast ? 'none' : 'auto' }}
                        >
                            {dayNum}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const BookingPage = () => {
    const { id } = useParams();
    const serviceId = parseInt(id);
    const [servicesData, setServicesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [service, setService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [scheduleData, setScheduleData] = useState([]);
    const [bookedTimes, setBookedTimes] = useState([]); // Состояние для забронированных времён
    const [user, setUser] = useState(null);

    const [showModal, setShowModal] = useState(false); // состояние для отображения модального окна
    const [bookingDetails, setBookingDetails] = useState({}); // данные для модального окна

    // Проверка localStorage при первой загрузке страницы
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const services = await fetchServices();
                setServicesData(services);

                const response = await fetch(`http://localhost:8080/api/getAllSchedules`);
                if (!response.ok) {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                }
                const data = await response.json();
                setScheduleData(data);
            } catch (error) {
                console.error('Ошибка при загрузке расписания:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Хук useEffect для получения забронированных времён
    useEffect(() => {
        const fetchBookedTimes = async () => {
            try {
                const response = await fetch(
                    `http://localhost:8080/api/getBookedTimes/${serviceId}/${selectedDate.toISOString().slice(0, 10)}`
                );
                if (!response.ok) {
                    throw new Error(`Ошибка HTTP: ${response.status}`);
                }
                const data = await response.json();
                console.log('Fetched booked times:', data); // Добавьте лог для проверки
                setBookedTimes(data); // Обновляем состояние с забронированными времёнами
            } catch (error) {
                console.error('Ошибка при загрузке забронированных времён:', error);
            }
        };

        // Вызов функции для получения занятых времён
        fetchBookedTimes();
    }, [serviceId, selectedDate]); // Обновляем при изменении serviceId или selectedDate

    useEffect(() => {
        if (servicesData.length > 0) {
            const foundService = servicesData.find(service => service.id === serviceId);
            setService(foundService);
        }
    }, [servicesData, serviceId]);

    const getDayOfWeek = (date) => (date.getDay() + 6) % 7;

    const handleDateClick = (date) => setSelectedDate(date);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (!service) {
        return <div>Услуга не найдена</div>;
    }

    const scheduleForService = scheduleData.filter(schedule => parseInt(schedule.service_id) === serviceId);

    const handleBooking = async (time) => {
        if (!user) {
            alert('Пожалуйста, войдите в систему, чтобы записаться на услугу.');
            return;
        }

        const bookingData = {
            userId: user.id, // Или любое другое поле с идентификатором пользователя
            serviceId: serviceId,
            date: selectedDate.toISOString().slice(0, 10), // Дата в формате YYYY-MM-DD
            time: time // Используем переданное время
        };

        try {
            const response = await fetch('http://localhost:8080/api/createBooking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData),
            });

            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }

            const result = await response.json();
            setBookedTimes(prevBookedTimes => [...prevBookedTimes, time]); // Добавляем новое время
            setBookingDetails({ title: service.title, date: result.booking_date, time: result.booking_time });
            setShowModal(true);
        } catch (error) {
            console.error('Ошибка при записи на услугу:', error);
            alert('Произошла ошибка при записи. Пожалуйста, попробуйте снова.');
        }
    };

    console.log("Booked Times:", bookedTimes);

    // Фильтрация доступных времён
    const renderAvailableTimes = () => {
        const selectedDayOfWeek = getDayOfWeek(selectedDate);
        const timesForDay = scheduleForService
            .filter(schedule => schedule.day_of_week === selectedDayOfWeek)
            .flatMap(schedule => schedule.time_slots || [])
            .filter(time => !bookedTimes.map(t => t.slice(0, 5)).includes(time)); // Измените здесь, чтобы сравнивать только HH:MM

        if (!timesForDay || timesForDay.length === 0) {
            return <p>Нет доступного времени для выбранного дня.</p>;
        }

        return timesForDay.map((time, index) => (
            <div key={index} className={style.availableTime}>
                <div className={style.timeServices}>{time}</div>
                <div className={style.deocorLine}></div>
                <div className={style.infoAndOptionService}>
                    <h4>{service.title}</h4>
                    <button onClick={() => handleBooking(time)}>Записаться</button>
                </div>
            </div>
        ));
    };

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

    return (
        <div className={style.container}>
            <div className={style.headerLinks}>
                <Link to={'/main'}>Главная</Link>
                <p>\</p>
                <Link to={'/services'}>Услуги</Link>
                <p>\</p>
                <span>{service.title || 'Записаться'}</span>
            </div>

            <div className={style.registrationFrom}>
                <div className={style.calendarBlock}>
                    <Calendar selectedDate={selectedDate} onDateClick={handleDateClick} />
                </div>

                <div className={style.timeSelectionBlock}>
                    <h3>Выберите время на запись</h3>
                    {renderAvailableTimes()}
                </div>
            </div>

            {showModal && (
                <div className={style.modal}>
                    <div className={style.modalContent}>
                        <button className={style.closeButton} onClick={() => setShowModal(false)}>✖</button>
                        <h2>Запись подтверждена!</h2>
                        <h3>Спасибо за запись на прием!</h3>
                        <div className={style.detalsBookings}>
                            <h4>Детали вашей записи:</h4>
                            <div className={style.detalBooking}>
                                <img src={require('./icons/calendar.png')}/>
                                <p>{formatDate(bookingDetails.date)}</p>
                            </div>
                            <div className={style.detalBooking}>
                                <img src={require('./icons/clock.png')}/>
                                <p>{formatTime(bookingDetails.time)}</p>
                            </div>
                            <div className={style.detalBooking}>
                                <img src={require('./icons/book.png')}/>
                                <p>{bookingDetails.title}</p>
                            </div>
                        </div>
                        <p>Если у вас есть вопросы или нужно изменить запись, свяжитесь с нами.</p>
                        <h6>Ждем вас!</h6>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingPage;
