const { cmd, commands } = require("../command");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

cmd(
  {
    pattern: "imagine",
    alias: ["aiimg", "aiart", "img", "genimg"],
    react: "🖼️",
    desc: "Generate AI images from text descriptions",
    category: "ai",
    usage: ".imagine <prompt>",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, reply }
  ) => {
    try {
      // Check if prompt is provided
      if (!q && (!quoted || !quoted.text)) {
        return reply(
          "Please provide a prompt for image generation.\nUsage: .imagine <prompt>"
        );
      }

      // Get the prompt from args or quoted message
      const prompt = q || (quoted && quoted.text);

      // Send a waiting message
      const waitMessage = await reply("⏳ *Generating your AI image...* This might take a moment.");
      
      // Create temp directory if it doesn't exist
      const tmpDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      
      // Choose one of the available free image generation APIs
      // Option 1: Stable Diffusion via public API
      try {
        // API configuration - replace with your preferred API
        const response = await axios({
          method: 'post',
          url: 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`, // Add your API key to .env file
          },
          data: {
            text_prompts: [
              {
                text: prompt,
                weight: 1
              }
            ],
            cfg_scale: 7,
            height: 1024,
            width: 1024,
            samples: 1,
            steps: 30,
          },
          responseType: 'json'
        });

        // Check if generation was successful
        if (response.data && response.data.artifacts && response.data.artifacts.length > 0) {
          // Get the base64 image
          const base64Image = response.data.artifacts[0].base64;
          const imageBuffer = Buffer.from(base64Image, 'base64');
          
          // Save image temporarily
          const tempImagePath = path.join(tmpDir, `ai_image_${Date.now()}.png`);
          fs.writeFileSync(tempImagePath, imageBuffer);
          
          // Send the generated image
          await robin.sendMessage(
            from,
            {
              image: { url: tempImagePath },
              caption: `*🖼️ AI Generated Image*\n\n*Prompt:* ${prompt}\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 CYBER-X AI`,
            },
            { quoted: mek }
          );
          
          // Clean up temp file
          setTimeout(() => {
            try {
              fs.unlinkSync(tempImagePath);
            } catch (err) {
              console.error("Failed to delete temp file:", err);
            }
          }, 5000);
          
        } else {
          throw new Error("No image was generated");
        }
      } catch (apiError) {
        console.error("Primary API error:", apiError);
        
        // Fallback to another API if the first one fails
        try {
          // Fallback API (HuggingFace-based free API or similar)
          const fallbackResponse = await axios({
            method: 'post',
            url: 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2',
            headers: {
              'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`, // Add to .env file
              'Content-Type': 'application/json'
            },
            data: { inputs: prompt },
            responseType: 'arraybuffer'
          });
          
          // Save the image temporarily
          const tempImagePath = path.join(tmpDir, `ai_image_${Date.now()}.png`);
          fs.writeFileSync(tempImagePath, fallbackResponse.data);
          
          // Send the generated image
          await robin.sendMessage(
            from,
            {
              image: { url: tempImagePath },
              caption: `*🖼️ AI Generated Image*\n\n*Prompt:* ${prompt}\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 CYBER-X AI`,
            },
            { quoted: mek }
          );
          
          // Clean up temp file
          setTimeout(() => {
            try {
              fs.unlinkSync(tempImagePath);
            } catch (err) {
              console.error("Failed to delete temp file:", err);
            }
          }, 5000);
          
        } catch (fallbackError) {
          console.error("Fallback API error:", fallbackError);
          reply("❌ Sorry, both image generation services are currently unavailable. Please try again later.");
        }
      }
      
    } catch (error) {
      console.error("AI image generation error:", error);
      reply(`❌ Error generating image: ${error.message || "Unknown error"}`);
    }
  }
);

// Additional command for advanced image generation with more options
cmd(
  {
    pattern: "imgpro",
    alias: ["imagepro", "advimg", "artpro"],
    desc: "Generate AI images with advanced settings",
    category: "ai",
    usage: ".imgpro <style>: <prompt>",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    { from, quoted, body, isCmd, command, args, q, reply }
  ) => {
    try {
      // Check if prompt is provided
      if (!q) {
        return reply(
          "Please provide a style and prompt for image generation.\n" +
          "Usage: .imgpro <style>: <prompt>\n\n" +
          "Available styles:\n" +
          "• anime - Anime style artwork\n" +
          "• digital - Digital art style\n" +
          "• oil - Oil painting style\n" +
          "• fantasy - Fantasy artwork\n" +
          "• photo - Photorealistic style\n" +
          "• cartoon - Cartoon style\n" +
          "• pixel - Pixel art style\n\n" +
          "Example: .imgpro anime: a cat playing with yarn"
        );
      }

      // Parse style and prompt
      let style, prompt;
      if (q.includes(":")) {
        [style, prompt] = q.split(":").map(item => item.trim());
      } else {
        style = "digital"; // Default style
        prompt = q;
      }

      // Define style presets
      const stylePresets = {
        anime: "anime artwork, anime style, highly detailed, vibrant colors",
        digital: "digital artwork, highly detailed, trending on artstation, concept art, sharp focus, illustration",
        oil: "oil painting, traditional media, highly detailed, realistic, by a masterful artist",
        fantasy: "fantasy artwork, highly detailed, magical, colorful, epic scene, painted by Greg Rutkowski and Thomas Kinkade",
        photo: "photorealistic, detailed, photography, 8k, high resolution, realistic",
        cartoon: "cartoon style, colorful, stylized, clean lines, disney pixar style",
        pixel: "pixel art, 16-bit, video game art, retro game style"
      };

      // Use the selected style or default to digital art if style not found
      const stylePrompt = stylePresets[style.toLowerCase()] || stylePresets.digital;
      const fullPrompt = `${prompt}, ${stylePrompt}`;

      // Send waiting message
      const waitMessage = await reply(`⏳ *Generating ${style} style AI image...* This might take a moment.`);
      
      // Create temp directory if it doesn't exist
      const tmpDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      try {
        // API request - using the same API as the main function
        const response = await axios({
          method: 'post',
          url: 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
          },
          data: {
            text_prompts: [
              {
                text: fullPrompt,
                weight: 1
              },
              {
                text: "deformed, bad anatomy, disfigured, watermark, signature, poorly drawn, low quality",
                weight: -1 // Negative prompt
              }
            ],
            cfg_scale: 7.5,
            height: 1024,
            width: 1024,
            samples: 1,
            steps: 40,
          },
          responseType: 'json'
        });

        // Check if generation was successful
        if (response.data && response.data.artifacts && response.data.artifacts.length > 0) {
          // Get the base64 image
          const base64Image = response.data.artifacts[0].base64;
          const imageBuffer = Buffer.from(base64Image, 'base64');
          
          // Save image temporarily
          const tempImagePath = path.join(tmpDir, `ai_image_${Date.now()}.png`);
          fs.writeFileSync(tempImagePath, imageBuffer);
          
          // Send the generated image
          await robin.sendMessage(
            from,
            {
              image: { url: tempImagePath },
              caption: `*🖼️ AI Generated Image (${style} style)*\n\n*Prompt:* ${prompt}\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 CYBER-X AI`,
            },
            { quoted: mek }
          );
          
          // Clean up temp file
          setTimeout(() => {
            try {
              fs.unlinkSync(tempImagePath);
            } catch (err) {
              console.error("Failed to delete temp file:", err);
            }
          }, 5000);
          
        } else {
          throw new Error("No image was generated");
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        reply("❌ Error generating image. The image generation service may be unavailable. Please try again later.");
      }
      
    } catch (error) {
      console.error("Advanced AI image generation error:", error);
      reply(`❌ Error generating image: ${error.message || "Unknown error"}`);
    }
  }
);
