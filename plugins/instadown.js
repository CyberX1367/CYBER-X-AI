const { cmd } = require("../command");
const axios = require("axios");

cmd(
  {
    pattern: "insta",
    alias: ["instagram", "igdl", "ig"],
    desc: "Download Instagram media (photo/reel/video)",
    category: "downloader",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      q,
      args,
      reply,
    }
  ) => {
    try {
      if (!q || !q.includes("instagram.com")) {
        return reply("❌ Please provide a valid Instagram post/reel URL.");
      }

      const res = await axios.get(`https://insta-api.vercel.app/api?url=${encodeURIComponent(q)}`);
      const result = res.data;

      if (!result || !result.data || result.data.length === 0) {
        return reply("❌ Failed to fetch media. Try another link.");
      }

      // Loop through and send each media item (video or image)
      for (const media of result.data) {
        if (media.type === "video") {
          await robin.sendMessage(
            from,
            { video: { url: media.url }, caption: "📥 Instagram Video" },
            { quoted: mek }
          );
        } else if (media.type === "image") {
          await robin.sendMessage(
            from,
            { image: { url: media.url }, caption: "📥 Instagram Photo" },
            { quoted: mek }
          );
        }
      }
    } catch (e) {
      console.error(e);
      reply("❌ Error fetching Instagram media.");
    }
  }
);
