// ScheduleData.js

let scheduleData = [];

export const fetchSchedule = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/getAllSchedules');
    if (!response.ok) {
      throw new Error('Ошибка при получении данных расписания');
    }
    const data = await response.json();

    // Прямо используем day_of_week без преобразования
    console.log("Original schedule data - ", data);
    return data;
  } catch (error) {
    console.error('Ошибка при получении расписания:', error);
    return [];
  }
};

export default scheduleData;
