const { cmd } = require('../command');
const axios = require('axios');
const cheerio = require('cheerio');

cmd({
    pattern: "img",
    alias: ["image", "googleimage"],
    react: '🖼️',
    category: "search",
    desc: "Search images from Google (no API)",
    filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
    try {
        if (!q) return await reply('❌ Please provide a search term!');

        await reply(`🔍 Searching images for *${q}*...`);

        // Google Images search URL
        const url = `https://www.google.com/search?q=${encodeURIComponent(q)}&tbm=isch`;
        
        // Make request with headers to look like a browser
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        const images = [];
        
        // Extract image URLs from the page
        $('img[src^="http"]').each((i, el) => {
            const src = $(el).attr('src');
            if (src && !src.includes('google.com/logos') && !src.includes('gstatic.com')) {
                images.push(src);
            }
        });

        // Filter to get unique images and limit to 5
        const uniqueImages = [...new Set(images)].slice(0, 5);
        
        if (uniqueImages.length === 0) {
            return await reply('❌ No images found!');
        }

        const caption = `🖼️ *Image Search Results* 🖼️\n\n*Query*: ${q}\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 *C_Y_B_E_R*`;

        // Send all images
        for (const imgUrl of uniqueImages) {
            try {
                await robin.sendMessage(from, {
                    image: { url: imgUrl },
                    caption: caption
                }, { quoted: mek });
                await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between sends
            } catch (e) {
                console.error('Error sending image:', e);
            }
        }

    } catch (error) {
        console.error('Error:', error);
        await reply('❌ Failed to fetch images. Google might be blocking requests.');
    }
});
