const { cmd, commands } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "weather",
    alias: ["forecast", "wthr"],
    react: "🌤️",
    desc: "Get weather information for a location",
    category: "utility",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("*Please provide a city name or location!* 🌍");
      
      // Replace with your actual OpenWeatherMap API key
      const API_KEY = "521e4978430715dfe0a7c6888ae92390";
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(q)}&units=metric&appid=${API_KEY}`;
      
      reply("*Fetching weather information...* 🔍");
      
      const response = await axios.get(url);
      const data = response.data;
      
      if (data.cod !== 200) {
        return reply(`*Error:* ${data.message || "Failed to fetch weather data"}`);
      }
      
      // Extract weather information
      const location = `${data.name}, ${data.sys.country}`;
      const temp = Math.round(data.main.temp);
      const feelsLike = Math.round(data.main.feels_like);
      const description = data.weather[0].description;
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;
      const pressure = data.main.pressure;
      const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
      const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
      
      // Weather icon mapping
      const weatherIcons = {
        Clear: "☀️",
        Clouds: "☁️",
        Rain: "🌧️",
        Drizzle: "🌦️",
        Thunderstorm: "⛈️",
        Snow: "❄️",
        Mist: "🌫️",
        Smoke: "🌫️",
        Haze: "🌫️",
        Dust: "🌫️",
        Fog: "🌫️",
        Sand: "🌫️",
        Ash: "🌫️",
        Squall: "💨",
        Tornado: "🌪️"
      };
      
      const mainWeather = data.weather[0].main;
      const weatherIcon = weatherIcons[mainWeather] || "🌈";
      
      // Create weather message
      const weatherMessage = `
*❤️ C_Y_B_E_R-X AI WEATHER INFO ❤️*

${weatherIcon} *Weather for:* ${location}
🌡️ *Temperature:* ${temp}°C
🌡️ *Feels like:* ${feelsLike}°C
📝 *Description:* ${description}
💧 *Humidity:* ${humidity}%
💨 *Wind speed:* ${windSpeed} m/s
🔍 *Pressure:* ${pressure} hPa
🌅 *Sunrise:* ${sunrise}
🌇 *Sunset:* ${sunset}

𝐌𝐚𝐝𝐞 𝐛𝐲 *C_Y_B_E_R*
> CYBER-X AI
      `;
      
      // Send weather info with image
      await robin.sendMessage(
        from,
        {
          image: {
            url: `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`,
          },
          caption: weatherMessage,
        },
        { quoted: mek }
      );
      
      return;
    } catch (e) {
      console.error(e);
      if (e.response && e.response.data) {
        return reply(`*Error:* ${e.response.data.message || "Failed to fetch weather data"}`);
      }
      reply(`*Error:* ${e.message || "An error occurred while fetching weather data"}`);
    }
  }
);
