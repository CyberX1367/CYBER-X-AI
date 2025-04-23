const { cmd, commands } = require("../command");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

cmd(
  {
    pattern: "imagine",
    alias: ["aiimg", "aiart", "img", "genimg"],
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
      
      // Using a free AI image generation API that doesn't require authentication
      // Note: Free APIs like this may have limitations or change their endpoints
      try {
        // Using a public API for testing
        const apiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
        
        // Download the image
        const imageResponse = await axios({
          method: 'get',
          url: apiUrl,
          responseType: 'arraybuffer'
        });
        
        // Save image temporarily
        const tempImagePath = path.join(tmpDir, `ai_image_${Date.now()}.jpg`);
        fs.writeFileSync(tempImagePath, imageResponse.data);
        
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
        
      } catch (apiError) {
        console.error("API error:", apiError);
        
        // Alternative method using another free service
        try {
          const fallbackUrl = `https://api.craiyon.com/v3`;
          
          // Send a request to the fallback API
          const response = await axios.post(fallbackUrl, {
            prompt: prompt,
            negative_prompt: "",
            version: "35s5hfwn9n78gb06",
            token: null
          });
          
          if (response.data && response.data.images && response.data.images.length > 0) {
            const imageData = response.data.images[0];
            const imageBuffer = Buffer.from(imageData, 'base64');
            
            // Save image temporarily
            const tempImagePath = path.join(tmpDir, `ai_image_${Date.now()}.jpg`);
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
        } catch (fallbackError) {
          console.error("Fallback API error:", fallbackError);
          
          // Third option using a different service
          try {
            const randomSeed = Math.floor(Math.random() * 1000000);
            const lexicaUrl = `https://lexica.art/api/v1/search?q=${encodeURIComponent(prompt)}`;
            
            const lexicaResponse = await axios.get(lexicaUrl);
            
            if (lexicaResponse.data && lexicaResponse.data.images && lexicaResponse.data.images.length > 0) {
              // Get a random image from results
              const images = lexicaResponse.data.images;
              const randomImage = images[Math.floor(Math.random() * images.length)];
              
              // Send the image URL directly
              await robin.sendMessage(
                from,
                {
                  image: { url: randomImage.src },
                  caption: `*🖼️ AI Image*\n\n*Prompt:* ${prompt}\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 CYBER-X AI`,
                },
                { quoted: mek }
              );
            } else {
              throw new Error("No images found");
            }
          } catch (thirdOptionError) {
            console.error("Third option error:", thirdOptionError);
            reply("❌ Sorry, all image generation services are currently unavailable. Please try again later.");
          }
        }
      }
      
    } catch (error) {
      console.error("AI image generation error:", error);
      reply(`❌ Error generating image: ${error.message || "Unknown error"}. Please make sure all APIs are configured correctly.`);
    }
  }
);
