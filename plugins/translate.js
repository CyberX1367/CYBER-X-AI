const { cmd } = require("../command");
const translate = require("@vitalets/google-translate-api");

cmd(
  {
    pattern: "tr",
    alias: ["translate"],
    react: "🌐",
    desc: "Translate text to a specific language",
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
      args,
      q,
      reply,
    }
  ) => {
    try {
      if (!q && !quoted) {
        return reply("❌ Please provide text or reply to a message to translate.\nExample: `.tr en`");
      }

      const lang = args[0]; // Language code like 'en', 'hi', 'fr'
      const text =
        q && args.length > 1
          ? args.slice(1).join(" ")
          : quoted
          ? quoted.text
          : "";

      if (!lang) {
        return reply("❌ Please specify the target language code.\nExample: `.tr en`");
      }

      if (!text) {
        return reply("❌ No text found to translate.");
      }

      const result = await translate(text, { to: lang });

      await reply(
        `🌐 *Translated to ${lang.toUpperCase()}*:\n\n${result.text}`
      );
    } catch (e) {
      console.error(e);
      reply(`Error: ${e.message || e}`);
    }
  }
);
