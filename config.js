const fs = require("fs");
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" });

function convertToBool(text, fault = "true") {
  return text === fault ? true : false;
}
module.exports = {
  SESSION_ID: process.env.SESSION_ID || "WNtTQJxB#q4fNOED2bY4m5kbolgqMDtzl654SU-kmTPk2hmsno8k",
  OWNER_NUM: process.env.OWNER_NUM || "94750915633",
};
