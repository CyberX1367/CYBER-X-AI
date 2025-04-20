const { cmd } = require("../command");
const translate = require("@vitalets/google-translate-api");

cmd(
  {
    pattern: "tr",
    alias: ["translate", "tl"],
    react: "🌐",
    desc: "Translate text to a target language",
    category: "utility",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      args,
      q,
      reply,
    }
  ) => {
    try {
      if (args.length < 2) {
        return reply("Usage: .tr <language_code> <text>\nExample: .tr hi Hello, how are you?");
      }

      const lang = args[0]; // target language code
      const text = args.slice(1).join(" ");

      const res = await translate(text, { to: lang });

      const responseMessage = `🔤 Translated to *${lang}*:\n${res.text}`;
      reply(responseMessage);
    } catch (err) {
      console.error(err);
      reply("❌ Failed to translate. Make sure the language code is correct.");
    }
  }
);
