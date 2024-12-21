import { fetchWeatherByCity, fetchWeatherByCoordinates } from './api.js';
import { 
    updateCurrentWeather, 
    updateExtendedForecast, 
    showError, 
    updateRecentSearches 
} from './ui.js';

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
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        const weatherData = await fetchWeatherByCoordinates(latitude, longitude);
                        this.updateWeatherDisplay(weatherData);
                    } catch (error) {
                        showError('Unable to fetch location weather data');
                    }
                },
                (error) => {
                    showError('Location access denied');
                }
            );
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
            
            //limit to only 5 recent cities
            if (this.recentCities.length > 5) {
                this.recentCities.pop();
            }

            // update recent cities in cache
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

//  application initialization
const weatherApp = new WeatherApp();
weatherApp.init();