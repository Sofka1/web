import React, { useEffect, useState } from 'react';
import { fetchServices } from '../../ServicesData'; // Импортируем fetchServices
import style from "./Main.module.css";
import { Link } from 'react-router-dom';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CSSTransition } from 'react-transition-group';
import { Element } from 'react-scroll';

const TestCard = ({ title, description, background }) => {
  return (
    <div className={style.testCard} style={{ background }}>
      <h2>{title}</h2>
      <p>{description}</p>
      <button className={style.goButton}>Перейти</button>
    </div>
  );
}; 

const ArticleCard = ({ id, title, description, background, onFavoriteToggle }) => {
  const favoriteArticles = JSON.parse(localStorage.getItem('favoriteArticles')) || [];

  // Проверяем, есть ли статья в избранном пользователя
  const [favorite, setFavorite] = useState(favoriteArticles.includes(id));

  const handleFavoriteClick = async () => {
    const newFavoriteState = !favorite;
    setFavorite(newFavoriteState);

    // Получаем список избранных из localStorage (или пустой массив по умолчанию)
    const user = JSON.parse(localStorage.getItem('user'));

    // Обновляем список избранных в localStorage
    if (newFavoriteState) {
      // Добавляем статью в избранное
      localStorage.setItem('favoriteArticles', JSON.stringify([...favoriteArticles, id]));
    } else {
      // Удаляем статью из избранного
      localStorage.setItem('favoriteArticles', JSON.stringify(favoriteArticles.filter((articleId) => articleId !== id)));
    }

    // Обновляем избранное на сервере, если пользователь авторизован
    if (user) {
      try {
        const response = await fetch('http://localhost:8080/api/favorites', {
          method: newFavoriteState ? 'POST' : 'DELETE', // POST для добавления, DELETE для удаления
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            article_id: id,      // Идентификатор статьи
            user_id: user.id,    // Идентификатор пользователя
          }),
        });

        if (!response.ok) {
          throw new Error('Ошибка при обновлении избранного');
        }

        console.log(newFavoriteState ? 'Статья добавлена в избранное' : 'Статья удалена из избранного');
      } catch (error) {
        console.error('Ошибка при добавлении/удалении из избранного:', error);
      }
    }


  };

  return (
    <div className={style.testCard} style={{ background }}>
      <h4 className={style.articlesTitle}>{title}</h4>
      <div className={style.optionArticles}>
        <Link className={style.goButton} to={`/articles/${id}`}>Перейти</Link>

        <div className={style.favoriteIcon} onClick={handleFavoriteClick}>
          {favorite ? (
            <span className={style.filledHeart}>❤️</span> // Закрашенное сердечко
          ) : (
            <span className={style.emptyHeart}>🤍</span> // Пустое сердечко
          )}
        </div>
      </div>
    </div>
  );
};


const SliderArticles = () => {
  const [articles, setArticles] = useState([]); // Установим пустой массив по умолчанию
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Загрузка статей из базы данных
    const fetchArticles = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/articles/all');
        const data = await response.json();
        setArticles(data || []);
      } catch (error) {
        console.error("Ошибка при загрузке статей:", error);
        setArticles([]); // Установим пустой массив при ошибке
      }
    };

    fetchArticles();
  }, []);

  const handleFavoriteToggle = async (articleId) => {
    const user = JSON.parse(localStorage.getItem('user')); // Предположим, что в localStorage хранится объект пользователя
    if (!user || !user.id) {
      console.error('Пользователь не авторизован');
      return;
    }

    try {
      console.log('Article ID:', articleId);
      const response = await fetch('http://localhost:8080/api/favorites/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id, // передаем user_id из localStorage
          article_id: articleId,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при добавлении в избранное');
      }

      console.log('Статья добавлена в избранное');
    } catch (error) {
      console.error(error.message);
    }
  };

  const totalSlides = Math.ceil(articles.length / 3);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  };

  const startIndex = currentSlide * 3;
  const currentArticles = articles.slice(startIndex, startIndex + 3);

  return (
    <div className={style.sliderContainer}>
      <div className={style.slides}>
        {currentArticles.map((article, index) => (
          <div key={index} className={style.slide}>
            <ArticleCard
              id={article.id}
              title={article.title}
              description={article.description}
              background="linear-gradient(45deg, #feecf1, #fff7f3)"
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={false} // Замените на актуальное свойство избранного
            />
          </div>
        ))}
      </div>
      {/* Переключатель */}
      <div className={style.sliderControls}>
        <button className={style.arrowButton} onClick={prevSlide}>
          <svg width="103" height="12" viewBox="0 0 103 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M102 7C102.552 7 103 6.55228 103 6C103 5.44772 102.552 5 102 5V7ZM0 6L10 11.7735V0.226497L0 6ZM102 5L9 5V7L102 7V5Z" fill="#545778" />
          </svg>
        </button>
        <div className={style.slideNumber}>
          {currentSlide + 1} / {totalSlides}
        </div>
        <button className={style.arrowButton} onClick={nextSlide}>
          <svg width="109" height="12" viewBox="0 0 109 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5C0.447715 5 -4.82823e-08 5.44772 0 6C4.82823e-08 6.55228 0.447715 7 1 7L1 5ZM109 5.99999L99 0.226489L99 11.7735L109 5.99999ZM1 7L100 6.99999L100 4.99999L1 5L1 7Z" fill="#545778" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const SliderArticlesMini = () => {
  const [articles, setArticles] = useState([]); // Установим пустой массив по умолчанию
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Загрузка статей из базы данных
    const fetchArticles = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/articles/all');
        const data = await response.json();
        setArticles(data || []);
      } catch (error) {
        console.error("Ошибка при загрузке статей:", error);
        setArticles([]); // Установим пустой массив при ошибке
      }
    };

    fetchArticles();
  }, []);

  const handleFavoriteToggle = async (articleId) => {
    const user = JSON.parse(localStorage.getItem('user')); // Предположим, что в localStorage хранится объект пользователя
    if (!user || !user.id) {
      console.error('Пользователь не авторизован');
      return;
    }

    try {
      console.log('Article ID:', articleId);
      const response = await fetch('http://localhost:8080/api/favorites/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id, // передаем user_id из localStorage
          article_id: articleId,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при добавлении в избранное');
      }

      console.log('Статья добавлена в избранное');
    } catch (error) {
      console.error(error.message);
    }
  };

  const totalSlides = articles.length;

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className={style.sliderContainer}>
      {articles.length > 0 ? (
        <div className={style.slides}>
          <ArticleCard
            id={articles[currentSlide].id}
            title={articles[currentSlide].title}
            description={articles[currentSlide].description}
            background="linear-gradient(45deg, #feecf1, #fff7f3)"
            onFavoriteToggle={() => handleFavoriteToggle(articles[currentSlide].id)}
            isFavorite={false} // Здесь замените на актуальное значение избранного
          />
        </div>
      ) : (
        <p>Загрузка статей...</p> // Показать сообщение, пока данные не загружены
      )}
      {/* Переключатель */}
      <div className={style.sliderControls}>
        <button className={style.arrowButton} onClick={prevSlide}>
          <svg width="103" height="12" viewBox="0 0 103 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M102 7C102.552 7 103 6.55228 103 6C103 5.44772 102.552 5 102 5V7ZM0 6L10 11.7735V0.226497L0 6ZM102 5L9 5V7L102 7V5Z" fill="#545778" />
          </svg>
        </button>
        <div className={style.slideNumber}>
          {currentSlide + 1} / {totalSlides}
        </div>
        <button className={style.arrowButton} onClick={nextSlide}>
          <svg width="109" height="12" viewBox="0 0 109 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5C0.447715 5 -4.82823e-08 5.44772 0 6C4.82823e-08 6.55228 0.447715 7 1 7L1 5ZM109 5.99999L99 0.226489L99 11.7735L109 5.99999ZM1 7L100 6.99999L100 4.99999L1 5L1 7Z" fill="#545778" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const SliderTests = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testCards = [
    {
      title: 'Тест 1',
      description: 'Описание теста 1',
      background: 'linear-gradient(45deg, #feecf1 0%, #fff7f3 100%)',
    },
    {
      title: 'Тест 2',
      description: 'Описание теста 2',
      background: 'linear-gradient(90deg, #fbfefe 0%, #fcfefe 100%)',
    },
    {
      title: 'Тест 3',
      description: 'Описание теста 3',
      background: 'linear-gradient(135deg, #fffef4 0%, #fff2f0 100%)',
    },
    {
      title: 'Тест 4',
      description: 'Описание теста 4',
      background: 'linear-gradient(45deg, #feecf1 0%, #fff7f3 100%)',
    },
    {
      title: 'Тест 5',
      description: 'Описание теста 5',
      background: 'linear-gradient(90deg, #fbfefe 0%, #fcfefe 100%)',
    },
    {
      title: 'Тест 6',
      description: 'Описание теста 6',
      background: 'linear-gradient(135deg, #fffef4 0%, #fff2f0 100%)',
    },
  ];

  const totalSlides = Math.ceil(testCards.length / 3);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  };

  const startIndex = currentSlide * 3;
  const currentCards = testCards.slice(startIndex, startIndex + 3);

  return (
    <div className={style.sliderContainer}>
      <div className={style.slides}>
        {currentCards.map((card, index) => (
          <div key={index} className={style.slide}>
            <TestCard title={card.title} description={card.description} background={card.background} />
          </div>
        ))}
      </div>
      {/* Переключатель */}
      <div className={style.sliderControls}>
        <button className={style.arrowButton} onClick={prevSlide}>
          <svg width="103" height="12" viewBox="0 0 103 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M102 7C102.552 7 103 6.55228 103 6C103 5.44772 102.552 5 102 5V7ZM0 6L10 11.7735V0.226497L0 6ZM102 5L9 5V7L102 7V5Z" fill="#545778" />
          </svg>
        </button>
        <div className={style.slideNumber}>
          {currentSlide + 1} / {totalSlides}
        </div>
        <button className={style.arrowButton} onClick={nextSlide}>
          <svg width="109" height="12" viewBox="0 0 109 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5C0.447715 5 -4.82823e-08 5.44772 0 6C4.82823e-08 6.55228 0.447715 7 1 7L1 5ZM109 5.99999L99 0.226489L99 11.7735L109 5.99999ZM1 7L100 6.99999L100 4.99999L1 5L1 7Z" fill="#545778" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const SliderTestsMini = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testCards = [
    {
      title: 'Тест 1',
      description: 'Описание теста 1',
      background: 'linear-gradient(45deg, #feecf1 0%, #fff7f3 100%)',
    },
    {
      title: 'Тест 2',
      description: 'Описание теста 2',
      background: 'linear-gradient(90deg, #fbfefe 0%, #fcfefe 100%)',
    },
    {
      title: 'Тест 3',
      description: 'Описание теста 3',
      background: 'linear-gradient(135deg, #fffef4 0%, #fff2f0 100%)',
    },
    {
      title: 'Тест 4',
      description: 'Описание теста 4',
      background: 'linear-gradient(45deg, #feecf1 0%, #fff7f3 100%)',
    },
    {
      title: 'Тест 5',
      description: 'Описание теста 5',
      background: 'linear-gradient(90deg, #fbfefe 0%, #fcfefe 100%)',
    },
    {
      title: 'Тест 6',
      description: 'Описание теста 6',
      background: 'linear-gradient(135deg, #fffef4 0%, #fff2f0 100%)',
    },
  ];

  const totalSlides = testCards.length;

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides);
  };

  return (
    <div className={style.sliderContainer}>
      <div className={style.slides}>
        <TestCard
          title={testCards[currentSlide].title}
          description={testCards[currentSlide].description}
          background={testCards[currentSlide].background}
        />
      </div>
      {/* Переключатель */}
      <div className={style.sliderControls}>
        <button className={style.arrowButton} onClick={prevSlide}>
          <svg width="103" height="12" viewBox="0 0 103 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M102 7C102.552 7 103 6.55228 103 6C103 5.44772 102.552 5 102 5V7ZM0 6L10 11.7735V0.226497L0 6ZM102 5L9 5V7L102 7V5Z" fill="#545778" />
          </svg>
        </button>
        <div className={style.slideNumber}>
          {currentSlide + 1} / {totalSlides}
        </div>
        <button className={style.arrowButton} onClick={nextSlide}>
          <svg width="109" height="12" viewBox="0 0 109 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 5C0.447715 5 -4.82823e-08 5.44772 0 6C4.82823e-08 6.55228 0.447715 7 1 7L1 5ZM109 5.99999L99 0.226489L99 11.7735L109 5.99999ZM1 7L100 6.99999L100 4.99999L1 5L1 7Z" fill="#545778" />
          </svg>
        </button>
      </div>
    </div>
  );
};


// Компонент для отображения звездочек
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

// Компонент карточки отзыва
const ReviewCard = ({ review, background }) => {
  const { name, rating, comment, avatar } = review;
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={style.reviewCard} style={{ background }}>
      <StarRating rating={rating} />
      <p className={`${style.commentUserForRevi} ${isExpanded ? style.expanded : ''}`}>{comment}</p>
      <button className={style.expanButton} onClick={toggleExpand}>
        {isExpanded ? 'Скрыть' : 'Показать больше'}
      </button>
      <div className={style.infoUserForRev}>
        <div className={style.avatarUser}>
          <img src={avatar || require('./image/defaultAvatar.png')} />
        </div>
        <p className={style.nameUserForRevi}>{name}</p>
      </div>
    </div>
  );
};

// SVG-иконка стрелки
const ArrowIcon = ({ isExpanded }) => (
  <svg
    width="26"
    height="26"
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={isExpanded ? style.rotated : ''}
  >
    <path
      d="M6.5 9.75L13 16.25L19.5 9.75" // Изменяем направление стрелки на вниз
      stroke="#545778"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Компонент FAQItem для одного вопроса и ответа
const FAQItem = ({ question, answer }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={style.faqItem}>
      <div className={style.faqQuestion} onClick={toggleExpand}>
        <p>{question}</p>
        <button className={style.expandButton}>
          <ArrowIcon isExpanded={isExpanded} />
        </button>
      </div>
      {isExpanded && <div className={style.faqAnswer}>{answer}</div>}
    </div>
  );
};

// Копирование почты с сообщением
const EmailCopy = () => {
  const [showNotification, setShowNotification] = useState(false);

  const handleCopy = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  return (
    <div className={style.containerCopy}>
      <CopyToClipboard text="ivka_83@mail.ru" onCopy={handleCopy}>
        <button className={style.copyButton}>
          <img className={style.iconCopyButton} src={require('./image/mail.png')} />
          ivka_83@mail.ru
        </button>
      </CopyToClipboard>
      <CSSTransition
        in={showNotification}
        timeout={500}
        classNames={{
          enter: style['notification-enter'],
          enterActive: style['notification-enter-active'],
          exit: style['notification-exit'],
          exitActive: style['notification-exit-active'],
        }}
        unmountOnExit
      >
        <div className={style.notification}>Почта успешно скопирована!</div>
      </CSSTransition>
    </div>
  );
};

// Копирование телефона с сообщением
const PhoneCopy = () => {
  const [showNotification, setShowNotification] = useState(false);

  const handleCopy = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 5000);
  };

  return (
    <div className={style.containerCopy}>
      <CopyToClipboard text="+7 967 371 7579" onCopy={handleCopy}>
        <button className={style.copyButton}>
          <img className={style.iconCopyButton} src={require('./image/phoneCall.png')} />
          +7 967 371 7579
        </button>
      </CopyToClipboard>
      <CSSTransition
        in={showNotification}
        timeout={500}
        classNames={{
          enter: style['notification-enter'],
          enterActive: style['notification-enter-active'],
          exit: style['notification-exit'],
          exitActive: style['notification-exit-active'],
        }}
        unmountOnExit
      >
        <div className={style.notification}>Телефон успешно скопирован!</div>
      </CSSTransition>
    </div>
  );
};

const Main = () => {
  const [services, setServices] = useState([]);
  const faqs = [
    {
      question: 'Что такое интегральное нейропрограммирование?',
      answer: (<span>
        Интегральное нейропрограммирование (ИНП) представляет собой современное (т.е. созданное уже в ХХI веке) направление практической психологии и психологически ориентированной психотерапии, получившее, несмотря на краткий срок своего существования очень широкое распространение как в России, так и в ближнем и дальнем зарубежье.
        <br />
        <br />
        Подробнее: <a className={style.answerLink} href="https://psy-in.ru/articles/vmesto-vvedeniya-ili-ochen-korotko-ob-integralnom-nejroprogrammirovanii-inp?ysclid=lrrp773125293140394 " target="_blank" rel="noopener noreferrer">https://psy-in.ru/articles/vmesto-vvedeniya-ili-ochen-korotko-ob-integralnom-nejroprogrammirovanii-inp?ysclid=lrrp773125293140394 </a>.
      </span>),
    },
    {
      question: 'Какова стоимость консультации?',
      answer: 'Стоимость консультации зависит от продолжительности и сложности случая. Пожалуйста, свяжитесь с нами для получения более подробной информации.',
    },
    {
      question: 'Как записаться на прием?',
      answer: 'Вы можете записаться на прием, заполнив форму на нашем сайте или позвонив по телефону.',
    },
  ];

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Подгружаем отзывы из API
    const fetchReviews = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/AllReviews');
        const data = await response.json();

        if (response.ok) {
          // Отображаем только первые три отзыва
          setReviews(data.slice(0, 3));
        } else {
          console.error('Ошибка при загрузке отзывов:', data.message);
        }
      } catch (error) {
        console.error('Ошибка запроса:', error);
      }
    };

    fetchReviews();
  }, []);

  const backgroundGradients = [
    'linear-gradient(45deg, #feecf1 0%, #fff7f3 100%)',
    'linear-gradient(90deg, #fbfefe 0%, #fcfefe 100%)',
    'linear-gradient(135deg, #fffef4 0%, #fff2f0 100%)'
  ];

  useEffect(() => {
    const loadServices = async () => {
      try {
        const fetchedServices = await fetchServices();
        setServices(fetchedServices); // Сохраняем загруженные услуги в состоянии
      } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
      }
    };

    loadServices(); // Загружаем данные при монтировании компонента
  }, []);

  // Используем slice, чтобы взять только первые 3 элемента
  const limitedServices = services.slice(0, 3);

  const formatCost = (cost) => {
    const parsedCost = parseFloat(cost);
    return parsedCost % 1 === 0 ? `${parsedCost} ₽` : `${parsedCost.toFixed(2)} ₽`;
  };

  return (
    <main className={style.main}>
      <div className={style.conteiner}>
        <div className={style.information}>
          <div className={style.title}>
            <h1>Практический психолог</h1>
            <h2>В методе интегрального нейропрограммирования ИНП С.В. Ковалёва</h2>
          </div>
          <Link to={'/services'}>
            <button className={style.enroll}>Записаться</button>
          </Link>
        </div>
        <div className={style.decoration}>
          <img src={require('./image/decor.png')} alt="decor" />
        </div>
      </div>

      <div className={style.voln}>
        <img src={require('./image/voln.png')} />
      </div>

      {/* Обо мне */}
      <div className={style.aboutMe}>
        <img src={require('./image/mam.png')} />
        <div className={style.aboutMeInformation}>
          <div className={style.titleAboutMe}>
            <h2>О себе</h2>
            <div className={style.decorAboutMe}></div>
          </div>
          <p>Я - <span>Екатерина Иванова</span>, и моя специализация - психологическое консультирование, основанное на интегральном нейропрограммировании. </p>
          <p>Мной успешно пройден сертифицированный курс "Практик", и мой <span>главный метод работы</span> - интегральное нейропрограммирование <span>ИНП</span> (2.0) разработанное профессором С.В. Ковалевым в Институте инновационных психотехнологий.</p>
        </div>
      </div>

      {/* Услуги */}
      <div className={style.inquiries}>
        <div className={style.inquiriesTitle}>
          <h3>С какими запросами я работаю</h3>
        </div>
        <div className={style.serviceCards}>
          {limitedServices.length > 0 ? (
            limitedServices.map((service) => (
              <div key={service.id} className={style.card1}>
                <div className={style.cardTitle}>
                  <p>{service.title}</p>
                </div>
                <div className={style.cardInfo}>
                  <div className={style.duration}>
                    <div className={style.infoTitle}>Длительность:</div>
                    <div className={style.tochki}></div>
                    <div className={style.infoValue}>
                      {service.duration.minutes ? `${service.duration.minutes} минут` : 'Не указано'}
                    </div>
                  </div>
                  <div className={style.format}>
                    <div className={style.infoTitle}>Формат:</div>
                    <div className={style.tochki}></div>
                    <div className={style.infoValue}>{service.format}</div>
                  </div>
                  <div className={style.cost}>
                    <div className={style.infoTitle}>Стоимость:</div>
                    <div className={style.tochki}></div>
                    <div className={style.infoValue}>{formatCost(service.cost)}</div>
                  </div>
                </div>
                <div className={style.cardOption}>
                  <Link className={style.linkCard} to={`/service/${service.id}`}>Подробнее</Link>
                  <button className={style.enroll}>Записаться</button>
                </div>
              </div>
            ))
          ) : (
            <p>Услуги не найдены.</p>
          )}
        </div>
        <div className={style.goCatalog}>
          <Link to="/services">
            <button>
              <div className={style.buttonGoCatalog}>
                <p>Каталог</p>
                <div className={style.blueArrow}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="#545778" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 5L19 12L12 19" stroke="#545778" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className={style.whiteArrow}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 5L19 12L12 19" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </button>
          </Link>
        </div>
      </div>

      <div className={style.voln2}>
        <img src={require('./image/voln.png')} />
      </div>

      {/* Мои преимущества */}
      <div className={style.myBenefits}>
        <div className={style.myBenefitsTitle}>Мои преимущества</div>
        <div className={style.myBenefitsContents}>
          <div className={style.myBenefitsInfo}>
            <p>Это <span>современное</span> (созданное в ХХ веке), <span>инновационное</span> направление практической психологии и психологически ориентированной психотерапии, вобравшее в себя опыт и самое лучшее из всех направлений классической психологии.</p>
            <p>Включает в себя все направления работы с человеком на всех его стадиях жизни.</p>
          </div>
          <img src={require('./image/decor2.png')} />
        </div>
      </div>

      {/* Отзывы */}
      <Element name="reviews">
        <div className={style.testimonials}>
          <h3>Отзывы</h3>
          <div className={style.reviewContainer}>
            {reviews.map((review, index) => (
              <ReviewCard
                key={review.id}
                review={review}
                background={backgroundGradients[index % backgroundGradients.length]}
              />
            ))}
          </div>
        </div>
      </Element>

      <div className={style.voln3}>
        <img src={require('./image/voln.png')} />
      </div>

      <Element name="faq">
        {/* Часто задаваемые вопросы */}
        <div className={style.faqBlock}>
          <h3>Часто задаваемые вопросы</h3>
          <div className={style.conteinerFAQ}>
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </Element>

      {/* Для самопознания */}
      <Element name="selfDevelopment">
        <div className={style.selfDiscovery}>
          <h3>Для самопознания</h3>
          <div className={style.conteinerSelfDiscovery}>
            <div className={style.sliderContainer}>
              <SliderTests />
            </div>
          </div>
        </div>
      </Element>

      {/* Для самопознания мини */}
      <Element name="selfDevelopment">
        <div className={style.selfDiscoveryMini}>
          <h3>Для самопознания</h3>
          <div className={style.conteinerSelfDiscovery}>
            <div className={style.sliderContainer}>
              <SliderTestsMini />
            </div>
          </div>
        </div>
      </Element>

      {/* Интересные статьи */}
      <Element>
        <div className={style.selfDiscovery}>
          <h3>Интересные статьи</h3>
          <div className={style.conteinerSelfDiscovery}>
            <div className={style.sliderContainer}>
              <SliderArticles />
            </div>
          </div>
        </div>
      </Element>

      {/* Интересные статьи */}
      <Element>
        <div className={style.selfDiscoveryMini}>
          <h3>Интересные статьи</h3>
          <div className={style.conteinerSelfDiscovery}>
            <div className={style.sliderContainer}>
              <SliderArticlesMini />
            </div>
          </div>
        </div>
      </Element>

      <div className={style.voln4}>
        <img src={require('./image/voln.png')} />
      </div>

      <Element name="contacts">
        {/* Остались вопросы? */}
        <div className={style.haveQuesion}>
          <div className={style.titleHaveQuesion}>
            <h3>Остались вопросы?</h3>
            <p>свяжитесь со мной</p>
          </div>
          <div className={style.haveQuesionLinks}>
            <EmailCopy />
            <div className={style.tgCopy}>
              <img className={style.iconCopyButton} src={require('./image/send.png')} />
              <Link className={style.tgLink} to="https://t.me/Ekaterina_INP">https://t.me/Ekaterina_INP</Link>
            </div>
            <PhoneCopy />
          </div>
        </div>
      </Element>
    </main>
  );
}

export default Main;