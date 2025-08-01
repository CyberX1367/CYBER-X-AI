const { cmd, commands } = require("../command");
const config = require('../config');

cmd(
  {
    pattern: "menu",
    alias: ["getmenu","cmdlist"],
    react: "📃",
    desc: "get cmd list",
    category: "main",
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
      let menu = {
        main: "",
        download: "",
        group: "",
        owner: "",
        convert: "",
        search: "",
      };

      for (let i = 0; i < commands.length; i++) {
        if (commands[i].pattern && !commands[i].dontAddCommandList) {
          menu[
            commands[i].category
          ] += `${config.PREFIX}${commands[i].pattern}\n`;
        }
      }

      let madeMenu = `👋 *Hello  ${pushname}*

___________________________________________
| *MAIN COMMANDS*     |
    ▫️.alive
    ▫️.menu
    ▫️.system
    ▫️.owner
| *DOWNLOAD COMMANDS* |
    ▫️.song <text>
    ▫️.video <text>
    ▫️.fb <link>
| *GROUP COMMANDS*    |
${menu.group}
| *OWNER COMMANDS*    |
    ▫️.restart
    ▫️.update
| *CONVERT COMMANDS*  |
    ▫️.sticker <reply img>
    ▫️.tr <lang><text>
    ▫️.tts <text>
    ▫️.toimg <reply image>
    ▫️.ttp <text>
| *SEARCH COMMANDS*   |
${menu.search}
    ▫️.weather <place>
| *AI COMMANDS*       |
    ▫️.ai <text>
    ▫️.aimg <text>


😎𝐌𝐚𝐝𝐞 𝐛𝐲 C_Y_B_E_R😎

> CYBER-X AI MENU MSG
`;
      await robin.sendMessage(
        from,
        {
          image: {
            url: "https://raw.githubusercontent.com/CyberX1367/Bot-Media/refs/heads/main/menu-img.jpeg",
          },
          caption: madeMenu,
        },
        { quoted: mek }
      );
    } catch (e) {
      console.log(e);
      reply(`${e}`);
    }
  }
);
