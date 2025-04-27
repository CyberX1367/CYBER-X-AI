const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

// API endpoint for Instagram content
const INSTA_API_URL = "https://api.skymansion.site/ig-dl/";
const API_KEY = config.INSTA_API_KEY;

cmd({
    pattern: "igdl",
    alias: ["instagram", "insta"],
    react: '📸',
    category: "download",
    desc: "Download videos/photos from Instagram",
    filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
    try {
        if (!q || q.trim() === '') return await reply('❌ Please provide an Instagram link!');
        
        const instagramUrl = q.trim();
        
        // Validate Instagram URL format
        if (!instagramUrl.includes('instagram.com')) {
            return await reply('❌ Please provide a valid Instagram URL');
        }
        
        await reply('⏳ Processing your request, please wait...');
        
        // Fetch media details from the API
        const apiUrl = `${INSTA_API_URL}?url=${encodeURIComponent(instagramUrl)}&api_key=${API_KEY}`;
        const response = await fetchJson(apiUrl);
        
        if (!response || !response.success) {
            return await reply('❌ Failed to fetch Instagram content. Please check the URL and try again.');
        }
        
        const mediaData = response.media;
        
        if (!mediaData || mediaData.length === 0) {
            return await reply('❌ No downloadable media found in this post.');
        }
        
        // Process each media item (could be multiple in carousel posts)
        let successCount = 0;
        
        for (let i = 0; i < mediaData.length; i++) {
            const media = mediaData[i];
            const isVideo = media.type === 'video';
            const mediaUrl = isVideo ? media.videoUrl : media.imageUrl;
            
            if (!mediaUrl) continue;
            
            try {
                // Download the media
                const fileName = `instagram_${Date.now()}_${i}${isVideo ? '.mp4' : '.jpg'}`;
                const filePath = path.join(__dirname, fileName);
                
                const { data } = await axios({
                    url: mediaUrl,
                    method: 'GET',
                    responseType: 'stream'
                });
                
                const writer = fs.createWriteStream(filePath);
                data.pipe(writer);
                
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                
                // Send the downloaded media
                await robin.sendMessage(from, {
                    [isVideo ? 'video' : 'image']: fs.readFileSync(filePath),
                    caption: `✅ Instagram ${isVideo ? 'Video' : 'Photo'} Downloaded\n\n> CYBER-X AI`,
                    quoted: mek
                });
                
                // Delete the file after sending
                fs.unlinkSync(filePath);
                successCount++;
                
            } catch (err) {
                console.error(`Error downloading media item ${i}:`, err);
                continue;
            }
        }
        
        if (successCount === 0) {
            await reply('❌ Failed to download any media from this post.');
        } else if (successCount < mediaData.length) {
            await reply(`⚠️ Downloaded ${successCount}/${mediaData.length} media items. Some items couldn't be processed.`);
        }
        
    } catch (error) {
        console.error('Error in Instagram download command:', error);
        await reply('❌ Sorry, something went wrong. Please try again later.');
    }
});

// Additional command for downloading Instagram stories
cmd({
    pattern: "igstory",
    alias: ["instastory", "instastories"],
    react: '🔥',
    category: "download",
    desc: "Download Instagram stories by username",
    filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
    try {
        if (!q || q.trim() === '') return await reply('❌ Please provide an Instagram username!');
        
        const username = q.trim().replace('@', '');
        
        await reply(`⏳ Fetching stories for @${username}, please wait...`);
        
        // Fetch stories from API
        const apiUrl = `${INSTA_API_URL}/stories?username=${encodeURIComponent(username)}&api_key=${API_KEY}`;
        const response = await fetchJson(apiUrl);
        
        if (!response || !response.success) {
            return await reply(`❌ Failed to fetch stories for @${username}. The account might be private or has no active stories.`);
        }
        
        const stories = response.stories;
        
        if (!stories || stories.length === 0) {
            return await reply(`❌ No active stories found for @${username}.`);
        }
        
        await reply(`📊 Found ${stories.length} stories. Downloading...`);
        
        // Process up to 5 stories to avoid spam
        const maxStories = Math.min(stories.length, 5);
        let successCount = 0;
        
        for (let i = 0; i < maxStories; i++) {
            const story = stories[i];
            const isVideo = story.type === 'video';
            const mediaUrl = isVideo ? story.videoUrl : story.imageUrl;
            
            if (!mediaUrl) continue;
            
            try {
                // Download the story
                const fileName = `igstory_${username}_${Date.now()}_${i}${isVideo ? '.mp4' : '.jpg'}`;
                const filePath = path.join(__dirname, fileName);
                
                const { data } = await axios({
                    url: mediaUrl,
                    method: 'GET',
                    responseType: 'stream'
                });
                
                const writer = fs.createWriteStream(filePath);
                data.pipe(writer);
                
                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });
                
                // Send the downloaded story
                await robin.sendMessage(from, {
                    [isVideo ? 'video' : 'image']: fs.readFileSync(filePath),
                    caption: `✅ Instagram Story ${i+1}/${maxStories} from @${username}\n\n> CYBER-X AI`,
                    quoted: mek
                });
                
                // Delete the file after sending
                fs.unlinkSync(filePath);
                successCount++;
                
            } catch (err) {
                console.error(`Error downloading story ${i}:`, err);
                continue;
            }
        }
        
        if (stories.length > maxStories) {
            await reply(`ℹ️ Showing ${maxStories} out of ${stories.length} available stories. Use the link to view all.`);
        }
        
    } catch (error) {
        console.error('Error in Instagram story command:', error);
        await reply('❌ Sorry, something went wrong. Please try again later.');
    }
});
