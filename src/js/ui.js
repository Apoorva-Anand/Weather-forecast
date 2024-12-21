import { getWeatherIcon } from './api.js';

export function updateCurrentWeather(weatherData) {
    const { 
        name, 
        main: { temp, humidity }, 
        wind: { speed }, 
        weather 
    } = weatherData.current;

    document.getElementById('cityName').textContent = name;
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString();
    document.getElementById('temperature').textContent = `${Math.round(temp)}°C`;
    document.getElementById('weatherDescription').textContent = weather[0].description;
    document.getElementById('weatherIcon').src = getWeatherIcon(weather[0].icon);
    document.getElementById('humidity').textContent = `${humidity}%`;
    document.getElementById('windSpeed').textContent = `${speed} m/s`;
}

export function updateExtendedForecast(forecastData) {
    const forecastContainer = document.getElementById('extendedForecast');
    forecastContainer.innerHTML = ''; // clear previous data

    // group forecast by day
    const dailyForecasts = {};
    forecastData.forecast.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                date: day,
                icon: forecast.weather[0].icon,
                temp: forecast.main.temp,
                wind: forecast.wind.speed,
                humidity: forecast.main.humidity
            };
        }
    });

    // create  forecast cards
    Object.values(dailyForecasts).slice(0, 5).forEach(dayForecast => {
        const forecastCard = document.createElement('div');
        forecastCard.className = 'text-center bg-blue-100 p-2 rounded-lg';
        forecastCard.innerHTML = `
            <p class="font-bold">${dayForecast.date}</p>
            <img src="${getWeatherIcon(dayForecast.icon)}" class="mx-auto" alt="Weather Icon">
            <p>${Math.round(dayForecast.temp)}°C</p>
            <p><i class="fas fa-wind"></i> ${dayForecast.wind} m/s</p>
            <p><i class="fas fa-tint"></i> ${dayForecast.humidity}%</p>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}

export function showError(message) {
    const errorContainer = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorContainer.classList.remove('hidden');

    // hide error aftr 3sec
    setTimeout(() => {
        errorContainer.classList.add('hidden');
    }, 3000);
}

export function updateRecentSearches(cities) {
    const recentSearchesContainer = document.getElementById('recentSearches');
    const dropdown = document.getElementById('recentSearchDropdown');
    
    dropdown.innerHTML = '';
    
    if (cities.length > 0) {
        recentSearchesContainer.classList.remove('hidden');
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            dropdown.appendChild(option);
        });
    } else {
        recentSearchesContainer.classList.add('hidden');
    }
}