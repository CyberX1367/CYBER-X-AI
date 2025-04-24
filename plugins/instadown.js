const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

// API endpoints for Instagram with separate API key
const API_URL = "https://api.skymansion.site/instagram/info";
const API_KEY = config.INSTAGRAM_API_KEY; // Use the specific Instagram API key

cmd({
    pattern: "insta",
    alias: ["ig", "instagram"],
    react: '📸',
    category: "download",
    desc: "Download Instagram videos, reels and posts",
    filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
    try {
        if (!q || q.trim() === '') return await reply('❌ Please provide an Instagram URL!');
        
        // Validate the Instagram URL format
        const igRegex = /(https?:\/\/)?(www\.)?(instagram\.com|instagr\.am)\/(p|reel|tv|stories)\/([A-Za-z0-9_-]+)\/?/;
        if (!igRegex.test(q)) {
            return await reply('❌ Invalid Instagram URL! Please provide a valid post, reel, or IGTV link.');
        }
        
        await reply('⏳ Downloading your Instagram media... Please wait');
        
        // Fetch Instagram post information
        const infoUrl = `${API_URL}?url=${encodeURIComponent(q)}&api_key=${API_KEY}`;
        let response = await fetchJson(infoUrl);
        
        if (!response || !response.success || !response.media) {
            return await reply('❌ Failed to fetch media. The post might be private or the URL is invalid.');
        }
        
        // Extract media info
        const { username, caption, media } = response;
        const mediaCount = Array.isArray(media) ? media.length : 1;
        
        // Send caption with media information
        const captionText = `
📸 *CYBER-X AI INSTAGRAM DOWNLOADER*
👤 *Username*: ${username || 'Unknown'}
📝 *Caption*: ${caption ? (caption.length > 100 ? caption.substring(0, 100) + '...' : caption) : 'No caption'}
📊 *Media Count*: ${mediaCount}

𝐌𝐚𝐝𝐞 𝐛𝐲 *C_Y_B_E_R*
>CYBER-X AI
`;

        await robin.sendMessage(
            from,
            {
                image: {
                    url: "https://raw.githubusercontent.com/CyberX1367/Bot-Media/refs/heads/main/ig-img.jpeg"
                },
                caption: captionText
            },
            { quoted: mek }
        );
        
        // Handle the media items
        const mediaItems = Array.isArray(media) ? media : [media];
        
        for (let i = 0; i < mediaItems.length; i++) {
            const mediaItem = mediaItems[i];
            const mediaUrl = mediaItem.url;
            const isVideo = mediaItem.type === 'video' || mediaUrl.includes('.mp4');
            const mediaCaption = `Media ${i+1}/${mediaItems.length}`;
            
            if (isVideo) {
                // Download video to server first
                const videoPath = path.join(__dirname, `../temp/insta_${Date.now()}.mp4`);
                const videoWriter = fs.createWriteStream(videoPath);
                
                try {
                    const videoResponse = await axios({
                        url: mediaUrl,
                        method: 'GET',
                        responseType: 'stream'
                    });
                    
                    videoResponse.data.pipe(videoWriter);
                    
                    await new Promise((resolve, reject) => {
                        videoWriter.on('finish', resolve);
                        videoWriter.on('error', reject);
                    });
                    
                    // Send video
                    await robin.sendMessage(
                        from,
                        {
                            video: fs.readFileSync(videoPath),
                            caption: mediaCaption
                        },
                        { quoted: mek }
                    );
                    
                    // Clean up
                    fs.unlinkSync(videoPath);
                } catch (downloadError) {
                    console.error('Download error:', downloadError);
                    await reply(`❌ Failed to download media item ${i+1}. Skipping...`);
                }
            } else {
                // Send image directly
                await robin.sendMessage(
                    from,
                    {
                        image: { url: mediaUrl },
                        caption: mediaCaption
                    },
                    { quoted: mek }
                );
            }
            
            // Add slight delay between messages to prevent flooding
            if (mediaItems.length > 1 && i < mediaItems.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        await reply('✅ Thanks for using CYBER-X AI Bot! 🤖❤️');
        
    } catch (error) {
        console.error('Error in Instagram download:', error);
        await reply('❌ An error occurred while processing your request. Please try again later.');
    }
});
