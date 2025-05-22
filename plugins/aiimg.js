const { cmd } = require("../command");
const axios = require("axios");

const DEEPAI_API_KEY = "c4f1c41b-dbac-477b-a8fe-82fbd86b19c9"; // Replace with your actual key

cmd(
  {
    pattern: "aiimage",
    alias: ["imggen", "deepimg"],
    react: "🧠",
    desc: "Generate an image using AI (DeepAI)",
    category: "ai",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      body,
      args,
      q,
      reply,
    }
  ) => {
    try {
      const prompt = q || args.join(" ");
      if (!prompt) {
        return reply("Please provide a prompt to generate an image.\nExample: `.aiimage a futuristic cyberpunk city`");
      }

      reply("🖼️ Generating your image...");

      const response = await axios.post(
        "https://api.deepai.org/api/text2img",
        { text: prompt },
        {
          headers: { "api-key": DEEPAI_API_KEY },
        }
      );

      const imageUrl = response?.data?.output_url;
      if (!imageUrl) return reply("Failed to generate image. Try again later.");

      await robin.sendMessage(from, { image: { url: imageUrl }, caption: `🧠 Prompt: ${prompt}` }, { quoted: mek });
    } catch (err) {
      console.error(err);
      reply("❌ Error generating image: " + (err?.response?.data?.error || err.message));
    }
  }
);
