const { cmd } = require("../command");
const googleTTS = require("google-tts-api");
const axios = require("axios");

cmd(
  {
    pattern: "tts",
    alias: ["say", "speak"],
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
      body,
      q,
      reply,
    }
  ) => {
    try {
      const text = q || body.replace(/^([.!/]tts|say|speak)\s+/, "");
      if (!text) return reply("Please provide some text to convert to speech.");

      // Max character limit for Google TTS API
      if (text.length > 200) return reply("Please limit the text to 200 characters.");

      // Generate the audio URL
      const url = googleTTS.getAudioUrl(text, {
        lang: "en",
        slow: false,
        host: "https://translate.google.com",
      });

      // Download the audio as buffer
      const { data } = await axios.get(url, { responseType: "arraybuffer" });

      // Send audio as voice note
      await robin.sendMessage(from, {
        audio: Buffer.from(data),
        mimetype: "audio/mp4",
        ptt: true, // true to send as voice note
      }, { quoted: mek });

    } catch (err) {
      console.error(err);
      reply(`Error: ${err.message || err}`);
    }
  }
);
