const { cmd, commands } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "tr",
    alias: ["translate"],
    react: "🌐","🗺️",
    desc: "Translate text to the specified language",
    category: "utility",
    usage: ".tr <language_code> <text>",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, isGroup, sender, reply }
  ) => {
    try {
      // Check if arguments are provided
      if (args.length < 2) {
        return reply(
          "Please provide a language code and text to translate.\nUsage: .tr <language_code> <text>"
        );
      }

      // Extract language code and text to translate
      const langCode = args[0].toLowerCase();
      const textToTranslate = args.slice(1).join(" ");

      // Make sure text to translate is provided
      if (!textToTranslate) {
        return reply("Please provide text to translate.");
      }

      // List of commonly used language codes for reference
      const commonLanguageCodes = {
        af: "Afrikaans",
        ar: "Arabic",
        bn: "Bengali",
        cs: "Czech",
        de: "German",
        en: "English",
        es: "Spanish",
        fr: "French",
        hi: "Hindi",
        id: "Indonesian",
        it: "Italian",
        ja: "Japanese",
        ko: "Korean",
        mr: "Marathi",
        ms: "Malay",
        nl: "Dutch",
        pt: "Portuguese",
        ru: "Russian",
        ta: "Tamil",
        te: "Telugu",
        tr: "Turkish",
        ur: "Urdu",
        vi: "Vietnamese",
        zh: "Chinese",
      };

      // Use Google Translate API
      const translateURL = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(
        textToTranslate
      )}`;

      const response = await axios.get(translateURL);
      
      // Extract the translated text from the response
      if (!response.data || !response.data[0] || !response.data[0][0] || !response.data[0][0][0]) {
        return reply("Failed to translate. Please check the language code and try again.");
      }

      const translatedText = response.data[0][0][0];
      const detectedSourceLang = response.data[2] || "auto";

      // Determine language names for better user experience
      const targetLangName = commonLanguageCodes[langCode] || langCode;
      const sourceLangName = commonLanguageCodes[detectedSourceLang] || detectedSourceLang;

      // Send the translation as response
      await robin.sendMessage(
        from,
        {
          text: `*Translation Result*\n\n` +
            `*From*: ${sourceLangName}\n` +
            `*To*: ${targetLangName}\n\n` +
            `*Original*: ${textToTranslate}\n\n` +
            `*Translated*: ${translatedText}\n\n` +
            `> 𝐌𝐚𝐝𝐞 𝐛𝐲 CYBER-X AI`,
        },
        { quoted: mek }
      );
    } catch (error) {
      console.error("Translation error:", error);
      reply(`Error translating text: ${error.message || "Unknown error"}`);
    }
  }
);
