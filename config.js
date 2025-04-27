const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: process.env.SESSION_ID || "WNtTQJxB#q4fNOED2bY4m5kbolgqMDtzl654SU-kmTPk2hmsno8k",
  OWNER_NUM: process.env.OWNER_NUM || "94750915633",
  PREFIX: process.env.PREFIX || ".",
  ALIVE_IMG: process.env.ALIVE_IMG || "https://raw.githubusercontent.com/CyberX1367/Bot-Media/refs/heads/main/alive-img.jpeg",
  ALIVE_MSG: process.env.ALIVE_MSG || "Hello , I am alive now!!\n\n😎𝐌𝐚𝐝𝐞 𝐛𝐲 C_Y_B_E_R😎",
  AUTO_READ_STATUS: process.env. AUTO_READ_STATUS || "false",
  MODE: process.env.MODE || "private",
  AUTO_VOICE: process.env.AUTO_VOICE || "true",
  AUTO_STICKER: process.env.AUTO_STICKER || "true",
  AUTO_REPLY: process.env.AUTO_REPLY || "true",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "AIzaSyCV3Uj1i9IMWiXFzLNuLvMPmdQwKCaYaHA",
  MOVIE_API_KEY: process.env.MOVIE_API_KEY || "sky|f43fef57541d6e71531b6484ce18d7083a842620",
  STABILITY_API_KEY: process.env.STABILITY_API_KEY || "sk-wV1WokWJLqqo8opW5UoZhzy4APFDtEz7Ijv4rhdCuJ8iWutM",
  INSTAGRAM_API_KEY: process.env.INSTAGRAM_API_KEY || "sky|723e151b6915f5da5bfa43a68ede9f05a92da566",
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY || "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",
  INSTA_API_KEY: process.env.INSTA_API_KEY || "sky|723e151b6915f5da5bfa43a68ede9f05a92da566",
  WEATHER_API_KEY: process.env.WEATHER_API_KEY || "521e4978430715dfe0a7c6888ae92390"
};
