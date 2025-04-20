const { cmd } = require("../command");
const gtts = require("node-gtts")("en"); // Default language: English
const fs = require("fs");
const path = require("path");

cmd(
  {
    pattern: "ttv",
    alias: ["say", "speak"],
    react: "🗣️",
    desc: "Convert text to speech",
    category: "utility",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      q, // text input
      reply,
    }
  ) => {
    try {
      if (!q) return reply("Please provide some text to convert to voice.");

      const filePath = path.join(__dirname, "voice.mp3");

      gtts.save(filePath, q, async () => {
        const audio = fs.readFileSync(filePath);
        await robin.sendMessage(from, { audio: audio, mimetype: "audio/mp4", ptt: true }, { quoted: mek });
        fs.unlinkSync(filePath); // Clean up
      });
    } catch (e) {
      console.error(e);
      reply("An error occurred while converting text to voice.");
    }
  }
);
