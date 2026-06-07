document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const weatherDisplay = document.getElementById('weather-display');

    const fetchWeather = async (city) => {
        if (!city.trim()) return;
        
        // Show loading state
        weatherDisplay.innerHTML = '<p>Loading weather data...</p>';
        
        try {
            // 1. Geocoding API: Convert City Name to Coordinates (Latitude/Longitude)
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
            
            if (!geoRes.ok) throw new Error('Failed to connect to the geocoding service.');
            
            const geoData = await geoRes.json();
            
            // Error Handling: Check if the city was found
            if (!geoData.results || geoData.results.length === 0) {
                throw new Error(`City "${city}" not found. Please check your spelling.`);
            }
            
            const { latitude, longitude, name, country } = geoData.results[0];

            // 2. Weather API: Fetch real-time weather using the coordinates
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&relative_humidity_2m=true&hourly=relative_humidity_2m`);
            
            if (!weatherRes.ok) throw new Error('Failed to fetch weather data.');
            
            const weatherData = await weatherRes.json();
            
            // 3. Parse nested JSON objects
            const current = weatherData.current_weather;
            // Grab the first hourly humidity data point for current humidity
            const humidity = weatherData.hourly.relative_humidity_2m[0];

            // 4. Dynamically render the DOM
            weatherDisplay.innerHTML = `
                <div class="weather-card">
                    <h3>${name}, ${country}</h3>
                    <div class="weather-metrics">
                        <div class="metric">
                            <span>Temperature</span>
                            <strong>${current.temperature}°C</strong>
                        </div>
                        <div class="metric">
                            <span>Wind Speed</span>
                            <strong>${current.windspeed} km/h</strong>
                        </div>
                        <div class="metric">
                            <span>Humidity</span>
                            <strong>${humidity}%</strong>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            // Comprehensive error handling rendering
            weatherDisplay.innerHTML = `<p class="weather-error">Error: ${error.message}</p>`;
        }
    };

    // Event Listeners for click and keyboard 'Enter'
    searchBtn.addEventListener('click', () => fetchWeather(cityInput.value));
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchWeather(cityInput.value);
    });
});
