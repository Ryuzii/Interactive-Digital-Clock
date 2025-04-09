document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const timeElement = document.querySelector('.time');
    const dateElement = document.querySelector('.date');
    const periodElement = document.querySelector('.period');
    const temperatureElement = document.querySelector('.temp-value');
    const weatherIconElement = document.querySelector('.weather-icon i');
    const locationElement = document.querySelector('.location');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const dayItems = document.querySelectorAll('.day-item');
    
    // Weather icons mapping
    const weatherIcons = {
        '01d': 'fa-sun',
        '01n': 'fa-moon',
        '02d': 'fa-cloud-sun',
        '02n': 'fa-cloud-moon',
        '03d': 'fa-cloud',
        '03n': 'fa-cloud',
        '04d': 'fa-cloud',
        '04n': 'fa-cloud',
        '09d': 'fa-cloud-showers-heavy',
        '09n': 'fa-cloud-showers-heavy',
        '10d': 'fa-cloud-rain',
        '10n': 'fa-cloud-rain',
        '11d': 'fa-bolt',
        '11n': 'fa-bolt',
        '13d': 'fa-snowflake',
        '13n': 'fa-snowflake',
        '50d': 'fa-smog',
        '50n': 'fa-smog'
    };
    
    // Theme toggle functionality
    let manualTheme = false;
    
    themeToggleBtn.addEventListener('click', () => {
        const body = document.body;
        manualTheme = !manualTheme;
        
        if (manualTheme) {
            body.classList.remove('morning-theme', 'afternoon-theme', 'evening-theme', 'night-theme');
            
            if (body.classList.contains('light-theme')) {
                body.classList.remove('light-theme');
                themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                body.classList.add('light-theme');
                themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            }
        } else {
            body.classList.remove('light-theme');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
            setTimeBasedTheme(new Date().getHours());
        }
    });
    
    // Function to update clock
    function updateClock() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Update time display
        timeElement.textContent = `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
        
        // Update date display
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
        
        // Update active day
        updateActiveDay(dayOfWeek);
        
        // Update period message and theme if not manually set
        if (!manualTheme) {
            setTimeBasedTheme(hours);
        }
        
        // Call this function again in 1 second
        setTimeout(updateClock, 1000);
    }
    
    // Function to update the active day
    function updateActiveDay(dayOfWeek) {
        dayItems.forEach(item => {
            item.classList.remove('active');
            if (parseInt(item.getAttribute('data-day')) === dayOfWeek) {
                item.classList.add('active');
            }
        });
    }
    
    // Set time-based theme and period message
    function setTimeBasedTheme(hours) {
        const body = document.body;
        body.classList.remove('morning-theme', 'afternoon-theme', 'evening-theme', 'night-theme');
        
        if (hours >= 5 && hours < 12) {
            periodElement.textContent = 'Good Morning';
            body.classList.add('morning-theme');
        } else if (hours >= 12 && hours < 17) {
            periodElement.textContent = 'Good Afternoon';
            body.classList.add('afternoon-theme');
        } else if (hours >= 17 && hours < 21) {
            periodElement.textContent = 'Good Evening';
            body.classList.add('evening-theme');
        } else {
            periodElement.textContent = 'Good Night';
            body.classList.add('night-theme');
        }
    }
    
    // Add leading zero to numbers less than 10
    function formatTime(time) {
        return time < 10 ? `0${time}` : time;
    }
    
    // Function to get user's location and weather data
    function getUserLocationAndWeather() {
        // Check if geolocation is supported by the browser
        if (navigator.geolocation) {
            // Get user's position
            navigator.geolocation.getCurrentPosition(
                // Success callback
                position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    getWeatherDataByCoords(lat, lon);
                },
                // Error callback
                error => {
                    console.error('Error getting user location:', error);
                    // Fallback to default location (Philippines)
                    getWeatherDataByCity('Manila');
                }
            );
        } else {
            // Geolocation not supported
            console.log('Geolocation is not supported by this browser');
            // Fallback to default location (Philippines)
            getWeatherDataByCity('Manila');
        }
    }
    
    // Get weather data using coordinates
    async function getWeatherDataByCoords(lat, lon) {
        try {
            const apiKey = 'bd5e378503939ddaee76f12ad7a97608'; // This is a demo key, rate limited
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
            
            if (!response.ok) {
                throw new Error('Weather API request failed');
            }
            
            const data = await response.json();
            updateWeatherUI(data);
            
            // Update weather every 10 minutes
            setTimeout(getUserLocationAndWeather, 600000);
        } catch (error) {
            console.error('Error fetching weather data by coordinates:', error);
            // Fallback to default city
            getWeatherDataByCity('Manila');
        }
    }
    
    // Get weather data using city name
    async function getWeatherDataByCity(city) {
        try {
            const apiKey = 'bd5e378503939ddaee76f12ad7a97608'; // This is a demo key, rate limited
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`);
            
            if (!response.ok) {
                throw new Error('Weather API request failed');
            }
            
            const data = await response.json();
            updateWeatherUI(data);
            
            // Update weather every 10 minutes
            setTimeout(() => getWeatherDataByCity(city), 600000);
        } catch (error) {
            console.error('Error fetching weather data by city:', error);
            // Use mock data if API fails
            const mockWeatherData = {
                main: {
                    temp: 30
                },
                weather: [
                    {
                        main: 'Clear',
                        icon: '01d'
                    }
                ],
                name: 'Manila',
                sys: {
                    country: 'PH'
                }
            };
            
            updateWeatherUI(mockWeatherData);
            setTimeout(() => getWeatherDataByCity(city), 600000);
        }
    }
    
    // Update UI with weather data
    function updateWeatherUI(data) {
        temperatureElement.textContent = Math.round(data.main.temp);
        locationElement.textContent = `${data.name}, ${data.sys.country}`;
        
        // Update weather icon
        const weatherIcon = data.weather[0].icon;
        const iconClass = weatherIcons[weatherIcon] || 'fa-cloud';
        
        weatherIconElement.className = '';
        weatherIconElement.classList.add('fas', iconClass);
    }
    
    // Add 3D tilt effect on mouse move
    const clockContainer = document.querySelector('.clock-container');
    document.addEventListener('mousemove', (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
        clockContainer.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    });
    
    // Reset transform on mouse leave
    document.addEventListener('mouseleave', () => {
        clockContainer.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
    
    // Initialize clock and weather
    updateClock();
    getUserLocationAndWeather();
    
    // Add click event to day items for information only (removed selection ability)
    dayItems.forEach(dayItem => {
        dayItem.style.cursor = 'default';
    });
}); 