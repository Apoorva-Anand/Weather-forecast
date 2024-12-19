const API_KEY = 'fd997c7ff44548f912dd5f8c866c703e';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function fetchWeatherByCity(cityName) {
    try {
        const currentWeatherResponse = await fetch(
            ${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric
        );
        const forecastResponse = await fetch(
            ${BASE_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric
        );

        if (!currentWeatherResponse.ok || !forecastResponse.ok) {
            throw new Error('City not found');
        }

        const currentWeather = await currentWeatherResponse.json();
        const forecast = await forecastResponse.json();

        return {
            current: currentWeather,
            forecast: forecast
        };
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
}

