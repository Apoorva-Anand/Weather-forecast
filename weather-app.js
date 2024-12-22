// API functions
const API_KEY = 'API_KEY';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

async function fetchWeatherByCity(cityName) {
    try {
        const currentWeatherResponse = await fetch(
            `${BASE_URL}/weather?q=${cityName}&appid=${API_KEY}&units=metric`
        );
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
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

async function fetchWeatherByCoordinates(lat, lon) {
    try {
        const currentWeatherResponse = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        if (!currentWeatherResponse.ok || !forecastResponse.ok) {
            throw new Error('Location not found');
        }

        const currentWeather = await currentWeatherResponse.json();
        const forecast = await forecastResponse.json();

        return {
            current: currentWeather,
            forecast: forecast
        };
    } catch (error) {
        console.error('Error fetching weather by coordinates:', error);
        throw error;
    }
}

function getWeatherIcon(iconCode) {
    return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// UI Functions
function updateCurrentWeather(weatherData) {
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

function updateExtendedForecast(forecastData) {
    const forecastContainer = document.getElementById('extendedForecast');
    forecastContainer.innerHTML = '';

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

function showError(message) {
    const errorContainer = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    errorText.textContent = message;
    errorContainer.classList.remove('hidden');

    setTimeout(() => {
        errorContainer.classList.add('hidden');
    }, 3000);
}

function updateRecentSearches(cities) {
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

// main class
class WeatherApp {
    constructor() {
        this.recentCities = [];
        this.initEventListeners();
    }

    initEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const locationBtn = document.getElementById('locationBtn');
        const citySearch = document.getElementById('citySearch');
        const recentSearchDropdown = document.getElementById('recentSearchDropdown');

        searchBtn.addEventListener('click', () => this.handleCitySearch());
        locationBtn.addEventListener('click', () => this.handleCurrentLocation());

        citySearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleCitySearch();
            }
        });

        recentSearchDropdown.addEventListener('change', (e) => {
            this.handleCitySearch(e.target.value);
        });
    }

    async handleCitySearch(city) {
        const cityInput = document.getElementById('citySearch');
        const searchCity = city || cityInput.value.trim();

        if (!searchCity) {
            showError('Please enter a city name');
            return;
        }

        try {
            const weatherData = await fetchWeatherByCity(searchCity);
            this.updateWeatherDisplay(weatherData, searchCity);
            this.addToRecentCities(searchCity);
            cityInput.value = '';
        } catch (error) {
            showError('Unable to fetch weather data. Please try again.');
        }
    }

    async handleCurrentLocation() {
        if ('geolocation' in navigator) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    });
                });

                const { latitude, longitude } = position.coords;
                const weatherData = await fetchWeatherByCoordinates(latitude, longitude);
                this.updateWeatherDisplay(weatherData);

            } catch (error) {
                let errorMessage = 'Unable to fetch location weather data';

                if (error.code) {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access was denied. Please check your browser settings.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out.';
                            break;
                    }
                }

                showError(errorMessage);
            }
        } else {
            showError('Geolocation is not supported by your browser');
        }
    }

    updateWeatherDisplay(weatherData, cityName) {
        updateCurrentWeather(weatherData);
        updateExtendedForecast(weatherData);
    }

    addToRecentCities(city) {
        if (!this.recentCities.includes(city)) {
            this.recentCities.unshift(city);
            if (this.recentCities.length > 5) {
                this.recentCities.pop();
            }
            localStorage.setItem('recentCities', JSON.stringify(this.recentCities));
            updateRecentSearches(this.recentCities);
        }
    }

    loadRecentCities() {
        const storedCities = localStorage.getItem('recentCities');
        if (storedCities) {
            this.recentCities = JSON.parse(storedCities);
            updateRecentSearches(this.recentCities);
        }
    }

    init() {
        this.loadRecentCities();
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    const weatherApp = new WeatherApp();
    weatherApp.init();
});