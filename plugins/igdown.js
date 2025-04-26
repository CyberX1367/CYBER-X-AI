const { cmd, commands } = require("../command");
const { instagramDl } = require("@bochilteam/scraper");
cmd(
  {
    pattern: "insta",
    alias: ["instagram", "ig"],
    react: "📥",
    desc: "Download Instagram Video/Image",
    category: "download",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      if (!q) return reply("*Please provide a valid Instagram URL!* 🌚❤️");
      // Validate the Instagram URL format
      const igRegex = /(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am|instagram)(\/[^\/]+)?\/([A-Za-z0-9_\-]+\/)?([A-Za-z0-9_\-]+)/;
      if (!igRegex.test(q))
        return reply("*Invalid Instagram URL! Please check and try again.* 🫥");
      
      // Fetch media details
      reply("*Downloading your Instagram media...* 😁❤️");
      const result = await instagramDl(q);
      
      if (!result || result.length === 0) {
        return reply("*Failed to download media. Please try again later.* 🫥😂");
      }
      
      // Prepare and send the message with media info
      let desc = `
*❤️ C_Y_B_E_R-X AI INSTAGRAM DOWNLOADER ❤️*
👻 *Type*: ${result.length > 1 ? "Multiple Media" : "Single Media"}
👻 *Source*: Instagram
𝐌𝐚𝐝𝐞 𝐛𝐲 *C_Y_B_E_R*
> CYBER-X AI
      `;
      
      await robin.sendMessage(
        from,
        {
          image: {
            url: "https://raw.githubusercontent.com/CyberX1367/Bot-Media/refs/heads/main/ig-img.jpeg",
          },
          caption: desc,
        },
        { quoted: mek }
      );
      
      // Send all media files
      for (let i = 0; i < result.length; i++) {
        const media = result[i];
        
        if (media.type === "image") {
          await robin.sendMessage(
            from,
            { image: { url: media.url }, caption: `----------IMAGE ${i+1}/${result.length}----------` },
            { quoted: mek }
          );
        } else if (media.type === "video") {
          await robin.sendMessage(
            from,
            { video: { url: media.url }, caption: `----------VIDEO ${i+1}/${result.length}----------` },
            { quoted: mek }
          );
        }
        
        // Add a slight delay between sending media files
        if (i < result.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return reply("*Thanks for using CYBER-X AI Bot* 🤖❤️");
    } catch (e) {
      console.error(e);
      reply(`*Error:* ${e.message || e}`);
    }
  }
);
