import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import style from './Articles.module.css';

const ArticlePage = () => {
    const { id } = useParams(); // Получаем id из URL
    const [article, setArticle] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        // Загрузка данных статьи и проверка избранного
        const fetchArticle = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/articles/${id}`);
                if (!response.ok) throw new Error('Ошибка загрузки статьи');
                const data = await response.json();
                setArticle(data);

                if (user) {
                    const favoriteResponse = await fetch(`http://localhost:8080/api/favorites/check`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ article_id: id, user_id: user.id }),
                    });
                    const favoriteData = await favoriteResponse.json();
                    setIsFavorite(favoriteData.isFavorite);
                }
            } catch (error) {
                console.error('Ошибка при загрузке статьи:', error);
            }
        };

        fetchArticle();
    }, [id, user]);


    // Обработчик для добавления/удаления из избранного
    const handleFavoriteClick = async () => {
        if (!user) return alert('Пожалуйста, войдите в аккаунт');

        try {
            const response = await fetch(`http://localhost:8080/api/favorites`, {
                method: isFavorite ? 'DELETE' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ article_id: id, user_id: user.id }),
            });
            if (!response.ok) {
                throw new Error('Ошибка при обновлении избранного');
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Ошибка при добавлении/удалении из избранного:', error);
        }
    };

    if (!article) {
        return <p>Загрузка...</p>; // Показать загрузку, пока данные не пришли
    }

    return (
        <div className={style.container}>
            <div className={style.headerArticle}>
                <h1>{article.title}</h1>
                <div className={style.favoriteIcon} onClick={handleFavoriteClick}>
                    {isFavorite ? <span className={style.filledHeart}>❤️</span> : <span className={style.emptyHeart}>🤍</span>}
                </div>
            </div>
            <p>Дата создания: {new Date(article.created_at).toLocaleDateString()}</p>
            <span>{article.content}</span>
        </div>
    );
};

export default ArticlePage;
