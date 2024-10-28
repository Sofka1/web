import React, { useState, useEffect } from 'react';
import style from './Header.module.css'; // Импортируем CSS-модули
import { Link, useNavigate } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Проверка localStorage при первой загрузке страницы
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser); // Устанавливаем пользователя, если данные есть
    } else {
      setUser(null); // Если данных нет, пользователь не авторизован
    }
  }, []);

  // Отслеживание изменений в localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser); // Обновляем состояние пользователя
      } else {
        setUser(null); // Если данные удалены
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Функция выхода
  const handleLogout = () => {
    localStorage.removeItem('user'); // Очищаем данные пользователя из localStorage
    setUser(null); // Сбрасываем состояние пользователя
    navigate('/login'); // Перенаправляем на страницу авторизации
  };

  return (
    <header className={style.header}>
      <div className={style.container}>
        <div className={style.logo}>
          <Link to={'/main'}><img className={style.logoImage} src={require('./image/logo.png')} alt="logo" /></Link>
        </div>
        <nav className={`${style.nav} ${isOpen ? style.open : ''}`}>
          <ul>
            <li><Link to="/main">Главная</Link></li>
            <li><Link to="/services">Услуги</Link></li>
            {/* <li><ScrollLink to="reviews" smooth={true} duration={500}>Отзывы</ScrollLink ></li> */}
            <li><ScrollLink to="faq" smooth={true} duration={500}>Частые вопросы</ScrollLink ></li>
            <li><ScrollLink to="selfDevelopment" smooth={true} duration={500}>Саморазвитие</ScrollLink ></li>
            <li><ScrollLink to="contacts" smooth={true} duration={500}>Контакты</ScrollLink ></li>
            <li><ScrollLink className={style.callButton} to="orderCall" smooth={true} duration={500}>Заказать звонок</ScrollLink></li>

            {/* Вход пользователя */}

            {user ? (
              <>
                <button className={style.buttonExit} onClick={handleLogout}>Выйти</button>
                {/* Отображаем имя пользователя и аватар */}
                <div className={style.userInfo}>
                  <Link to={`/userPage/${user.id}`}>
                    <img
                      src={user.userImage ? user.userImage : require('./image/defaultAvatar.png')}
                      alt="User Avatar"
                      className={style.avatar}
                    />
                  </Link>
                  <Link to={`/userPage/${user.id}`}>{user.name}</Link> {/* Имя пользователя */}
                </div>
              </>
            ) : (
              <>
                {/* Если пользователь не авторизован, показываем ссылки на авторизацию и регистрацию */}
                <li><Link to="/login"><img className={style.userImage} src={require('./image/user.png')} alt="user" /></Link></li>
              </>
            )}


          </ul>
        </nav>
        <div
          className={`${style.burger} ${isOpen ? style.open : ''}`}
          onClick={toggleMenu}
        >
          <div className={style.line1}></div>
          <div className={style.line2}></div>
          <div className={style.line3}></div>
        </div>
      </div>
    </header>
  );
};

export default Header;