require("dotenv").config();
const { cmd } = require("../command");
const axios = require("axios");

const DEEPAI_API_KEY = process.env.DEEPAI_API_KEY;

cmd(
  {
    pattern: "aiimage",
    alias: ["imggen", "deepimg"],
    react: "🧠",
    desc: "Generate an image using AI (DeepAI)",
    category: "ai",
    filename: __filename,
  },
  async (robin, mek, m, { from, body, args, q, reply }) => {
    try {
      const prompt = q || args.join(" ");
      if (!prompt) {
        return reply(
          "📝 Please provide a prompt to generate an image.\n\nExample: `.aiimage a futuristic cyberpunk city`"
        );
      }

      reply("🖼️ Generating your image...");

      const response = await axios.post(
        "https://api.deepai.org/api/text2img",
        { text: prompt },
        {
          headers: { "api-key": DEEPAI_API_KEY },
          timeout: 30000,
        }
      );

      const imageUrl = response?.data?.output_url;
      if (!imageUrl) {
        return reply("⚠️ Failed to generate image. Try a different prompt.");
      }

      await robin.sendMessage(
        from,
        { image: { url: imageUrl }, caption: `🧠 Prompt: ${prompt}` },
        { quoted: mek }
      );
    } catch (err) {
      console.error(err);

      if (err?.response?.status === 429) {
        return reply("🚫 Rate limit hit. Please wait and try again later.");
      }

      reply("❌ Error generating image: " + (err?.response?.data?.error || err.message));
    }
  }
);
