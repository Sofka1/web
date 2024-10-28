let servicesData = [];

export const fetchServices = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/getAllServices'); // Убедись, что путь корректный
    if (!response.ok) {
      throw new Error('Ошибка при получении данных с сервера');
    }
    const data = await response.json(); // Парсим ответ как JSON
    return data; // Возвращаем данные
  } catch (error) {
    console.error('Ошибка при получении данных:', error);
    return []; // Возвращаем пустой массив, чтобы избежать undefined
  }
};

 
export default servicesData;
