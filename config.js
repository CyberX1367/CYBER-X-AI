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
};
