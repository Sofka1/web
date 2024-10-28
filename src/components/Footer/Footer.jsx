import React, { useState, useEffect } from 'react';
import style from './Footer.module.css';
import { Link } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { Element } from 'react-scroll';
import axios from 'axios';

const PhoneForm = () => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/callback', { phone });
      setMessage(response.data);
    } catch (error) {
      setMessage('Ошибка при отправке данных');
    }
  };

  return (
    <div className={style.containerForm}>
      <form onSubmit={handleSubmit} className={style.formStyle}>
        <input
          type="tel"
          placeholder="Ваш телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className={style.input}
        />
        <button type="submit" className={style.button}>Заказать звонок</button>
      </form>
      {message && <p className={style.message}>{message}</p>}
    </div>
  );
};


const Footer = () => {
  return (
    <footer className={style.footer}>
      <div className={style.footerHeader}>
        <div className={style.footerLine}></div>
        <img className={style.footerLogo} src={require('./image/Logo.png')} />
        <div className={style.footerLine}></div>
      </div>

      <div className={style.footerContent}>
        <div className={style.formFooter}>
          <div className={style.formFooterInfo}>
            <h4>Хотите узнать больше? Оставьте <br /> свой номер, и мы вам перезвоним!</h4>
            <p>Нажимая кнопку “Заказать звонок”, вы соглашаетесь с нашей <Link className={style.formLink} to=''>политикой конфиденциальности</Link></p>
          </div>

          <Element name="orderCall">
            <div className={style.formPhone}>
              <PhoneForm />
            </div>
          </Element>

        </div>

        <div className={style.menuFooter}>
          <ul>
            <li><Link to="/main">Главная</Link></li>
            <li><Link to="/services">Услуги</Link></li>
            <li><ScrollLink to="reviews" smooth={true} duration={500}>Отзывы</ScrollLink ></li>
            <li><ScrollLink to="faq" smooth={true} duration={500}>Частые вопросы</ScrollLink ></li>
            <li><ScrollLink to="selfDevelopment" smooth={true} duration={500}>Саморазвитие</ScrollLink ></li>
            <li><ScrollLink to="contacts" smooth={true} duration={500}>Контакты</ScrollLink ></li>
          </ul>
        </div>
      </div>

      <div className={style.footerLinks}>
        <div className={style.footerLine}></div>
        <div className={style.contentLinks}>
          <p>© 2024 - Все права защищены.</p>
          <div className={style.footerDocs}>
            <Link className={style.dockLink} to=''>Политика конфиденциальности</Link>
            <Link className={style.dockLink} to=''>Условия предоставления услуг</Link>
            <Link className={style.dockLink} to=''>Настройки файлов cookie</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;