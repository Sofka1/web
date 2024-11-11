import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import style from './OneServices.module.css';
import { fetchServices } from '../../ServicesData'; // Импортируем функцию для получения данных
import { Link } from 'react-router-dom';

const OneServices = () => {
    const { id } = useParams(); // Получаем ID из URL
    const [service, setService] = useState(null); // Состояние для выбранной услуги
    const [loading, setLoading] = useState(true); // Состояние для отслеживания загрузки
    const defaultServicesImage = require('../../imageServices/1.png');
    const [reviews, setReviews] = useState([]);
    const [error, setError] = useState(null);

    // Функция для получения отзывов
    const fetchReviews = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/reviews/service/${id}`);
            const data = await response.json();
            setReviews(data); // Сохраняем отзывы в состоянии
            setLoading(false); // Останавливаем индикатор загрузки
        } catch (error) {
            setError('Ошибка при загрузке отзывов');
            setLoading(false);
        }
    };
 

    useEffect(() => {
        fetchReviews(); // Загружаем отзывы при монтировании компонента
    }, [id]);

    // Загрузка данных услуги
    useEffect(() => { 
        const loadServiceData = async () => {
            try {
                const services = await fetchServices(); // Загружаем данные услуг
                const foundService = services.find((service) => service.id === parseInt(id)); // Ищем услугу по ID
                setService(foundService); // Сохраняем найденную услугу в состояние
            } catch (error) {
                console.error('Ошибка при загрузке данных услуги:', error);
            } finally {
                setLoading(false); // Завершаем состояние загрузки
            }
        };

        loadServiceData(); // Вызываем функцию загрузки
    }, [id]);

    // Проверяем, идёт ли загрузка
    if (loading) {
        return <div>Загрузка...</div>;
    }

    // Проверяем, найдена ли услуга
    if (!service) {
        return (
            <div className={style.container}>
                <h2>Услуга не найдена</h2>
                <p>К сожалению, услуга с таким идентификатором не найдена.</p>
            </div>
        );
    }

    // Компонент для отображения звёздочек
    const StarRating = ({ rating }) => {
        const maxStars = 5;
        const stars = [];

        const starContainerStyle = {
            display: 'inline-block',
            width: '24px',
            height: '24px',
            borderRadius: '2px',
            margin: '0px',
            textAlign: 'center',
            lineHeight: '22px',
            color: '#f86a6c',
            fontSize: '24px'
        };

        for (let i = 1; i <= maxStars; i++) {
            stars.push(
                <span key={i} style={starContainerStyle}>
                    {i <= rating ? '★' : '☆'}
                </span>
            );
        }

        return <div>{stars}</div>;
    };

    const backgroundGradients = [
        'linear-gradient(45deg, #feecf1 0%, #fff7f3 100%)',
        'linear-gradient(90deg, #fbfefe 0%, #fcfefe 100%)',
        'linear-gradient(135deg, #fffef4 0%, #fff2f0 100%)'
    ];

    return (
        <div className={style.container}>
            <div className={style.headerService}>
                <div className={style.navigationService}>
                    <Link to={`/main`}>Главная</Link>
                    <p>\</p>
                    <Link to={`/services`}>Услуги</Link>
                    <p>\</p>
                    <Link to={`/service/${service.id}`}>{service.title}</Link>
                </div>
                <button>Записаться</button>
            </div>

            <div className={style.mainContent}>
                {/* image */}
                <div className={style.serviceImage}>
                    <img src={service.imagePath ? service.imagePath : defaultServicesImage} />
                </div>

                {/* info about services */}
                <div className={style.infoAbout}>
                    <h2>{service.title}</h2>
                    <h5>Описание:</h5>
                    <p>{service.description}</p>
                </div>
            </div>

            <div className={style.dopContent}>
                {/* one card */}
                <div className={style.cardDopContent}>
                    <div className={style.iconBlock}>
                        <img src={require('./image/icons/clock.png')} alt="clock icon" />
                    </div>
                    <div className={style.cardInfo}>
                        <h6>Продолжительность сеанса</h6>
                        <p>{service.duration.hours ? `${service.duration.hours} час${service.duration.hours > 1 ? 'а' : ''} ${service.duration.minutes ? service.duration.minutes + ' мин' : ''}` : `${service.duration.minutes} мин`}</p>
                    </div>
                </div>

                {/* one card */}
                <div className={style.cardDopContent}>
                    <div className={style.iconBlock}>
                        <img src={require('./image/icons/monitor.png')} alt="monitor icon" />
                    </div>
                    <div className={style.cardInfo}>
                        <h6>Формат сеанса</h6>
                        <p>{service.format}</p>
                    </div>
                </div>

                {/* one card */}
                <div className={style.cardDopContent}>
                    <div className={style.iconBlock}>
                        <img src={require('./image/icons/p.png')} alt="price icon" />
                    </div>
                    <div className={style.cardInfo}>
                        <h6>Стоимость сеанса</h6>
                        <p>{service.cost} </p>
                    </div>
                </div>
            </div>

            <div className={style.reviewsBlock}>
                <div className={style.reviewsTitle}>
                    <div className={style.decorTitle}></div>
                    <h3>Отзывы</h3>
                    <div className={style.decorTitle}></div>
                </div>

                <div className={style.testimonials}>
                    {loading ? (
                        <p>Загрузка отзывов...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : reviews.length > 0 ? (
                        <div className={style.reviewContainer}>
                            {reviews.map((review, index) => (
                                <div key={review.id} className={style.reviewCard} style={{ background: backgroundGradients[index % backgroundGradients.length] }}>
                                    <div className={style.mainUserInfo}>
                                        <div className={style.infoUserForRev}>
                                            <div className={style.avatarUser}>
                                                <img src={review.avatar || require('./image/defaultAvatar.png')} />
                                            </div>
                                            <p className={style.nameUserForRevi}>{review.name}</p>
                                        </div>
                                        <div className={style.userRating}>
                                            <StarRating rating={review.rating} />
                                        </div>
                                    </div>

                                    <p className={`${style.commentUserForRevi} ${style.expanded}`}>
                                        {review.comment}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Отзывов для этой услуги пока нет.</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default OneServices;
