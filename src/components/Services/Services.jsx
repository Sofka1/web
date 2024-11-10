import React, { useEffect, useState } from 'react';
import styles from './Services.module.css';
import { Link } from 'react-router-dom';
import { fetchServices } from '../../ServicesData';

const Services = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [filterCost, setFilterCost] = useState('');
  const [filterFormat, setFilterFormat] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [services, setServices] = useState(null); // Изначально null, чтобы отследить статус

  const parseCost = (cost) => parseFloat(cost.replace(/[^\d,.]/g, '').replace(',', '.')); // Заменяем запятую на точку

  useEffect(() => {
    const loadServices = async () => {
      try {
        const fetchedServices = await fetchServices();
        console.log('Fetched services:', fetchedServices); // Лог для проверки данных
        setServices(fetchedServices);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
 
    loadServices();
  }, []);

  // Проверка наличия данных перед фильтрацией
  if (!services) {
    return <p>Загрузка услуг...</p>; // Пока данные загружаются
  }

  const matchDuration = (serviceDuration, filterDuration) => {
    if (!serviceDuration) return false; // Проверяем, существует ли serviceDuration
  
    const durationInMinutes = (serviceDuration.hours || 0) * 60 + (serviceDuration.minutes || 0);
    const filterDurationInMinutes = filterDuration === "30 мин" ? 30 : filterDuration === "1 час" ? 60 : 0;
  
    return filterDurationInMinutes === durationInMinutes;
  };

  const filteredServices = services.filter((service) => {
    const title = service.title ? service.title.toLowerCase() : ''; // Используем title вместо name
    const format = service.format ? service.format.toLowerCase() : '';
    const cost = service.cost ? parseCost(service.cost) : 0; // Стоимость как число

    // const duration = service.duration
    //   ? `${service.duration.hours ? service.duration.hours + ' час' : ''} ${service.duration.minutes ? service.duration.minutes + ' мин' : ''}`.trim()
    //   : '';

    // Сравнение стоимости с фильтром
    const isCostMatch = filterCost ? cost <= parseCost(filterCost) : true;

    return (
      title.includes(searchTerm.toLowerCase()) &&
      (filterDuration ? matchDuration(service.duration, filterDuration) : true) &&
      isCostMatch && // Исправленное условие для стоимости
      (filterFormat ? format.includes(filterFormat.toLowerCase()) : true)
    );
  });


  const formatDuration = (duration) => {
    if (!duration) return 'Неизвестная длительность'; // Если duration не существует
  
    const hours = duration.hours || 0;
    const minutes = duration.minutes || 0;
  
    if (hours && minutes) {
      return `${hours} час ${minutes} мин`;
    } else if (hours) {
      return `${hours} час`;
    } else if (minutes) {
      return `${minutes} мин`;
    } else {
      return 'Неизвестная длительность'; // На случай, если нет данных
    }
  };

  const formatCost = (cost) => {
    const parsedCost = parseFloat(cost);
    return parsedCost % 1 === 0 ? `${parsedCost} ₽` : `${parsedCost.toFixed(2)} ₽`;
  };  

  const servicesPerPage = 5;
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const displayedServices = filteredServices.slice(
    (currentPage - 1) * servicesPerPage,
    currentPage * servicesPerPage
  );

  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) =>
      direction === 'next'
        ? Math.min(prevPage + 1, totalPages)
        : Math.max(prevPage - 1, 1)
    );
  };

  const handleResetFilters = () => {
    setFilterDuration('');
    setFilterCost('');
    setFilterFormat('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const renderServiceCard = (service, index) => {
    let cardStyle = {};
    switch (index % 3) {
      case 0:
        cardStyle = { background: 'linear-gradient(45deg, #feecf1 0%, #fff7f3 100%)' };
        break;
      case 1:
        cardStyle = { background: 'linear-gradient(90deg, #fbfefe 0%, #fcfefe 100%)' };
        break;
      case 2:
        cardStyle = { background: 'linear-gradient(135deg, #fffef4 0%, #fff2f0 100%)' };
        break;
      default:
        break;
    }

    return (
      <div key={service.id} className={styles.serviceCard} style={cardStyle}>
        <Link to={`/service/${service.id}`} className={styles.titleLink}><h3>{service.title}</h3></Link>
        <div className={styles.info}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Длительность:</span>
            <div className={styles.tochki}></div>
            <span className={styles.infoValue}>{formatDuration(service.duration)}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Формат:</span>
            <div className={styles.tochki}></div>
            <span className={styles.infoValue}>{service.format}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Стоимость:</span>
            <div className={styles.tochki}></div>
            <span className={styles.infoValue}>{formatCost(service.cost)}</span>
          </div>
        </div>
        <div className={styles.optionCard}>
          <Link to={`/service/${service.id}`} className={styles.moreButton}>
            Подробнее
          </Link>
          <Link to={`/booking/${service.id}`}><button>Записаться</button></Link>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.filterSection}>
        <div className={styles.filters}>
          <select
            value={filterDuration}
            onChange={(e) => setFilterDuration(e.target.value)}
            className={styles.select}
          >
            <option value="">Длительность сеанса</option>
            <option value="30 мин">30 мин</option>
            <option value="1 час">1 час</option>
          </select>
          <select
            value={filterCost}
            onChange={(e) => setFilterCost(e.target.value)}
            className={styles.select}
          >
            <option value="">Стоимость</option>
            <option value="1000">до 1000 ₽</option>
            <option value="3000">до 3000 ₽</option>
          </select>
          <select
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
            className={styles.select}
          >
            <option value="">Формат сеанса</option>
            <option value="онлайн">Онлайн</option>
            <option value="очно">Очно</option>
          </select>
          {(filterDuration || filterCost || filterFormat || searchTerm) && (
            <button onClick={handleResetFilters} className={styles.resetButton}>
              Сбросить фильтры
            </button>
          )}
        </div>
        <div className={styles.search}>
          <button className={styles.searchButton}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#545778" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20.9999 20.9999L16.6499 16.6499" stroke="#545778" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <input
            type="text"
            placeholder="Поиск..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.servicesGrid}>
        {displayedServices.length > 0 ? (
          displayedServices.map((service, index) => renderServiceCard(service, index))
        ) : (
          <p>Услуги не найдены.</p>
        )}
      </div>

      <div className={styles.pagination}>
        <button
          onClick={() => handlePageChange('prev')}
          disabled={currentPage === 1}
        >
          &lt; Предыдущая
        </button>
        <span>
          {currentPage} / {totalPages}
        </span>
        <button
          onClick={() => handlePageChange('next')}
          disabled={currentPage === totalPages}
        >
          Следующая &gt;
        </button>
      </div>
    </div>
  );
};

export default Services;
