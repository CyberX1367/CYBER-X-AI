const { cmd } = require('../command');
const axios = require('axios');

cmd({
    pattern: "aimg",
    alias: ["t2i", "aigen"],
    react: "🖼️",
    category: "AI",
    desc: "Generate AI images using ModelsLab's Stable Diffusion API",
    filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply("❌ Please provide a prompt (e.g., .aimg futuristic city)");

        await reply("🎨 Generating your image... (This may take 15-30 seconds)");

        // Get your API key from https://modelslab.com/dashboard/api-keys
        const API_KEY = "347ch7g8iV9j8kXMzsYG5GEenn8s6KvpUq4B1DjTMIlVqQRRk5psiQy9Csb0"; 
        const API_URL = "https://modelslab.com/api/v6/realtime/text2img";

        const payload = {
            key: API_KEY,
            prompt: q,
            negative_prompt: "blurry, deformed, extra limbs",
            width: "512",
            height: "512",
            samples: "1",
            safety_checker: false,
            enhance_prompt: true
        };

        // First API call to start generation
        const { data } = await axios.post(API_URL, payload, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (data.status === "processing") {
            // Check status until completed
            let resultUrl = data.fetch_result;
            let attempts = 0;
            
            while (attempts < 20) { // Max 20 attempts (~30 sec timeout)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                const status = await axios.get(resultUrl, {
                    headers: { 'Content-Type': 'application/json' }
                });
                
                if (status.data.status === "success") {
                    const imageUrl = status.data.output[0];
                    await robin.sendMessage(from, {
                        image: { url: imageUrl },
                        caption: `🖼️ *AI Generated Image*\n\n*Prompt:* ${q}\n\nPowered by *ModelsLab*\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *C_Y_B_E_R*`
                    }, { quoted: mek });
                    return;
                }
                attempts++;
            }
            return await reply("❌ Generation timed out. Try again later.");
        }

        // If immediate result (unlikely)
        if (data.status === "success") {
            await robin.sendMessage(from, {
                image: { url: data.output[0] },
                caption: `🖼️ *AI Generated Image*\n\n*Prompt:* ${q}\n\nPowered by *ModelsLab*`
            }, { quoted: mek });
        }

    } catch (error) {
        console.error("ModelsLab Error:", error);
        await reply(`❌ Error: ${error.response?.data?.message || "Failed to generate image"}`);
    }
});
