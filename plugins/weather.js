const { cmd } = require('../command');
const axios = require('axios');
const config = require('../config');
const fs = require('fs-extra');
const path = require('path');

// Weather API information
const WEATHER_API_KEY = config.WEATHER_API_KEY; // Add this to your config file
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

cmd({
    pattern: "weather",
    alias: ["forecast", "climate"],
    react: '🌦️',
    category: "utilities",
    desc: "Get current weather updates for any location",
    filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
    try {
        if (!q || q.trim() === '') return await reply('❌ Please provide a city name! (e.g., London)');
        
        await reply(`🔍 Fetching weather information for *${q}*...`);
        
        // Make API request
        const weatherUrl = `${WEATHER_API_URL}?q=${encodeURIComponent(q)}&appid=${WEATHER_API_KEY}&units=metric`;
        const response = await axios.get(weatherUrl);
        
        if (response.status !== 200) {
            return await reply(`❌ Could not find weather information for: *${q}*`);
        }
        
        const data = response.data;
        
        // Extract weather information
        const location = `${data.name}, ${data.sys.country}`;
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const description = data.weather[0].description;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const pressure = data.main.pressure;
        const visibility = (data.visibility / 1000).toFixed(1); // Convert to km
        const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
        const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
        
        // Get weather icon code and map to emoji
        const iconCode = data.weather[0].icon;
        const weatherEmoji = getWeatherEmoji(iconCode);
        
        // Prepare weather message
        const weatherMessage = `
🌍 *CYBER-X AI WEATHER UPDATES* 🌍

📍 *Location*: ${location}
${weatherEmoji} *Weather*: ${description}
🌡️ *Temperature*: ${temp}°C (Feels like: ${feelsLike}°C)
💧 *Humidity*: ${humidity}%
💨 *Wind Speed*: ${windSpeed} m/s
🔍 *Visibility*: ${visibility} km
⏱️ *Pressure*: ${pressure} hPa
🌅 *Sunrise*: ${sunrise}
🌇 *Sunset*: ${sunset}

𝐌𝐚𝐝𝐞 𝐛𝐲 *C_Y_B_E_R*
>CYBER-X AI
`;

        // Select appropriate weather image based on conditions
        const weatherImageUrl = getWeatherImageUrl(iconCode);
        
        await robin.sendMessage(
            from,
            {
                image: { url: weatherImageUrl },
                caption: weatherMessage
            },
            { quoted: mek }
        );
        
    } catch (error) {
        console.error('Error in weather command:', error);
        
        if (error.response && error.response.status === 404) {
            await reply(`❌ Location not found: *${q}*. Please check the spelling and try again.`);
        } else {
            await reply('❌ An error occurred while fetching weather data. Please try again later.');
        }
    }
});

// Function to map weather icon code to emoji
function getWeatherEmoji(iconCode) {
    const weatherIcons = {
        '01d': '☀️', // clear sky (day)
        '01n': '🌙', // clear sky (night)
        '02d': '⛅', // few clouds (day)
        '02n': '☁️', // few clouds (night)
        '03d': '☁️', // scattered clouds
        '03n': '☁️',
        '04d': '☁️', // broken clouds
        '04n': '☁️',
        '09d': '🌧️', // shower rain
        '09n': '🌧️',
        '10d': '🌦️', // rain (day)
        '10n': '🌧️', // rain (night)
        '11d': '⛈️', // thunderstorm
        '11n': '⛈️',
        '13d': '❄️', // snow
        '13n': '❄️',
        '50d': '🌫️', // mist
        '50n': '🌫️'
    };
    
    return weatherIcons[iconCode] || '🌈';
}

// Function to get weather image URL based on conditions
function getWeatherImageUrl(iconCode) {
    // Map icon codes to image categories
    const imageCategory = iconCode.substring(0, 2);
    
    const weatherImages = {
        '01': 'https://raw.githubusercontent.com/CyberX1367/Bot-Media/refs/heads/main/weather-sunny.jpeg',
        '02': 'https://raw.githubusercontent.com/CyberX1367/Bot-Media/refs/heads/main/weather-cloudy.jpeg',
        '03': 'https://raw.githubusercontent.com/CyberX1367/Bot-Media/refs/heads/main/weather-cloudy.jpeg',
        '04': 'https://raw.githubusercontent.com/CyberX1367/Bot-Media/refs/heads/main/weather-cloudy.jpeg',
        '09': 'https://raw.githubusercontent.com/CyberX1367/Bot-Media/refs/heads/main/weather-rain.jpeg',
        '10': 'https://raw.githubusercontent.com/CyberX1367/Bot-Media/refs/heads/main/weather-rain.jpeg',
        '11': 'https://raw.githubusercontent.com/CyberX1367/Bot-Media/refs/heads/main/weather-storm.jpeg',
        '13': 'https://raw.githubusercontent.com/CyberX1367/Bot-Media/refs/heads/main/weather-snow.jpeg',
        '50': 'https://raw.githubusercontent.com/CyberX1367/Bot-Media/refs/heads/main/weather-mist.jpeg'
    };
    
    return weatherImages[imageCategory] || 'https://raw.githubusercontent.com/CyberX1367/Bot-Media/refs/heads/main/weather-default.jpeg';
}
