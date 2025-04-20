const { cmd, commands } = require("../command");
const { Sticker } = require("wa-sticker-formatter");
const fs = require("fs");
const path = require("path");
const canvas = require("canvas");

cmd(
  {
    pattern: "tsticker",
    alias: ["ttp", "textsticker", "ts"],
    desc: "Convert text to a sticker",
    category: "sticker",
    usage: ".tsticker <text>",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, reply }
  ) => {
    try {
      // Check if text is provided
      const text = q ? q : (quoted && quoted.text ? quoted.text : null);
      
      if (!text) {
        return reply(
          "Please provide text to convert to a sticker.\nUsage: .tsticker <text>"
        );
      }

      // Create a temporary directory for sticker processing if it doesn't exist
      const tmpDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      // Function to create text image
      const createTextImage = async (text) => {
        // Set canvas dimensions
        const width = 512;
        const height = 512;
        
        // Create canvas
        const cnv = canvas.createCanvas(width, height);
        const ctx = cnv.getContext("2d");
        
        // Fill background
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
        
        // Set text properties
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Calculate font size based on text length
        const words = text.split(" ");
        const longestWord = words.reduce((longest, current) => 
          current.length > longest.length ? current : longest, "");
          
        let fontSize = Math.min(60, 500 / (longestWord.length * 0.6));
        
        // Adjust font size for multi-line text
        const lineCount = Math.ceil(text.length / 20); // Rough estimate of line count
        fontSize = Math.min(fontSize, 400 / lineCount);
        
        ctx.font = `bold ${fontSize}px Arial`;
        
        // Add text to image with word wrapping
        const words_array = text.split(' ');
        let line = '';
        let lines = [];
        const maxWidth = width * 0.8;
        const lineHeight = fontSize * 1.2;
        
        for (let i = 0; i < words_array.length; i++) {
          const testLine = line + words_array[i] + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && i > 0) {
            lines.push(line);
            line = words_array[i] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);
        
        // Calculate total text height
        const totalTextHeight = lineHeight * lines.length;
        let y = (height - totalTextHeight) / 2 + fontSize / 2;
        
        // Draw each line
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], width / 2, y);
          y += lineHeight;
        }
        
        return cnv.toBuffer("image/png");
      };

      // Create text image
      reply("Creating your text sticker...");
      const imageBuffer = await createTextImage(text);
      
      // Save the image temporarily
      const tempImagePath = path.join(tmpDir, `text_${Date.now()}.png`);
      fs.writeFileSync(tempImagePath, imageBuffer);

      // Create sticker from the image
      const sticker = new Sticker(tempImagePath, {
        pack: "CYBER-X AI",
        author: "C_Y_B_E_R",
        type: "FULL",
        quality: 100,
        categories: ["🤩", "🎉"],
      });

      // Convert to WebP format
      const stickerBuffer = await sticker.toBuffer();
      
      // Send the sticker
      await robin.sendMessage(
        from, 
        { sticker: stickerBuffer }, 
        { quoted: mek }
      );

      // Clean up temporary file
      try {
        fs.unlinkSync(tempImagePath);
      } catch (cleanupErr) {
        console.error("Failed to clean up temp file:", cleanupErr);
      }
      
    } catch (error) {
      console.error("Text to sticker error:", error);
      reply(`Error creating sticker: ${error.message || "Unknown error"}`);
    }
  }
);

// Additional styling options
cmd(
  {
    pattern: "styledtext",
    alias: ["sts", "stylesticker", "sttp"],
    desc: "Convert text to a styled sticker with background options",
    category: "sticker",
    usage: ".styledtext <text> | <background>",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, reply }
  ) => {
    try {
      if (!q && (!quoted || !quoted.text)) {
        return reply(
          "Please provide text and optional background style.\nUsage: .styledtext <text> | <background>\n" +
          "Available backgrounds: gradient, neon, rainbow, black, blue, red, pink"
        );
      }

      // Parse text and background from input
      let text, bgStyle;
      if (q.includes("|")) {
        [text, bgStyle] = q.split("|").map(item => item.trim());
      } else {
        text = q || (quoted && quoted.text ? quoted.text : "");
        bgStyle = "gradient"; // Default style
      }
      
      if (!text) {
        return reply("Please provide text to convert to a sticker.");
      }

      // Create temp directory if not exists
      const tmpDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      // Function to create styled text image
      const createStyledTextImage = async (text, style) => {
        const width = 512;
        const height = 512;
        const cnv = canvas.createCanvas(width, height);
        const ctx = cnv.getContext("2d");
        
        // Apply different background styles
        switch (style.toLowerCase()) {
          case "gradient":
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, "#1e3c72");
            gradient.addColorStop(1, "#2a5298");
            ctx.fillStyle = gradient;
            break;
          case "neon":
            ctx.fillStyle = "#000000";
            ctx.shadowColor = "#00f7ff";
            ctx.shadowBlur = 20;
            break;
          case "rainbow":
            const rainbowGradient = ctx.createLinearGradient(0, 0, width, 0);
            rainbowGradient.addColorStop(0, "red");
            rainbowGradient.addColorStop(0.17, "orange");
            rainbowGradient.addColorStop(0.33, "yellow");
            rainbowGradient.addColorStop(0.5, "green");
            rainbowGradient.addColorStop(0.67, "blue");
            rainbowGradient.addColorStop(0.83, "indigo");
            rainbowGradient.addColorStop(1, "violet");
            ctx.fillStyle = rainbowGradient;
            break;
          case "black":
            ctx.fillStyle = "#000000";
            break;
          case "blue":
            ctx.fillStyle = "#0047AB";
            break;
          case "red":
            ctx.fillStyle = "#8B0000";
            break;
          case "pink":
            ctx.fillStyle = "#FF69B4";
            break;
          default:
            ctx.fillStyle = "#000000";
        }
        
        // Fill background
        ctx.fillRect(0, 0, width, height);
        
        // Set text color based on background
        if (["black", "blue", "gradient", "neon", "red"].includes(style.toLowerCase())) {
          ctx.fillStyle = "#FFFFFF";
        } else {
          ctx.fillStyle = "#000000";
        }
        
        // For neon style, make text glow
        if (style.toLowerCase() === "neon") {
          ctx.fillStyle = "#ffffff";
          ctx.shadowColor = "#00f7ff";
          ctx.shadowBlur = 15;
        }
        
        // Calculate font size and prepare text
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        const words = text.split(" ");
        const longestWord = words.reduce((longest, current) => 
          current.length > longest.length ? current : longest, "");
          
        let fontSize = Math.min(60, 500 / (longestWord.length * 0.6));
        const lineCount = Math.ceil(text.length / 20);
        fontSize = Math.min(fontSize, 400 / lineCount);
        
        ctx.font = `bold ${fontSize}px Arial`;
        
        // Word wrapping
        const words_array = text.split(' ');
        let line = '';
        let lines = [];
        const maxWidth = width * 0.8;
        const lineHeight = fontSize * 1.2;
        
        for (let i = 0; i < words_array.length; i++) {
          const testLine = line + words_array[i] + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && i > 0) {
            lines.push(line);
            line = words_array[i] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);
        
        // Draw text
        const totalTextHeight = lineHeight * lines.length;
        let y = (height - totalTextHeight) / 2 + fontSize / 2;
        
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], width / 2, y);
          y += lineHeight;
        }
        
        return cnv.toBuffer("image/png");
      };

      // Create text image with selected style
      reply(`Creating your styled text sticker with ${bgStyle} background...`);
      const imageBuffer = await createStyledTextImage(text, bgStyle);
      
      // Save the image temporarily
      const tempImagePath = path.join(tmpDir, `styled_${Date.now()}.png`);
      fs.writeFileSync(tempImagePath, imageBuffer);

      // Create sticker from the image
      const sticker = new Sticker(tempImagePath, {
        pack: "CYBER-X AI",
        author: "C_Y_B_E_R",
        type: "FULL",
        quality: 100,
        categories: ["🤩", "🎉"],
      });

      // Convert to WebP format
      const stickerBuffer = await sticker.toBuffer();
      
      // Send the sticker
      await robin.sendMessage(
        from, 
        { sticker: stickerBuffer }, 
        { quoted: mek }
      );

      // Clean up temporary file
      try {
        fs.unlinkSync(tempImagePath);
      } catch (cleanupErr) {
        console.error("Failed to clean up temp file:", cleanupErr);
      }
      
    } catch (error) {
      console.error("Styled text to sticker error:", error);
      reply(`Error creating sticker: ${error.message || "Unknown error"}`);
    }
  }
);
