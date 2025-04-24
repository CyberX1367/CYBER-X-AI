const { cmd } = require('../command');
const { fetchJson } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

cmd({
    pattern: "wiki",
    alias: ["wikipedia", "pedia"],
    react: '📚',
    category: "search",
    desc: "Search information from Wikipedia",
    filename: __filename
}, async (robin, m, mek, { from, q, reply }) => {
    try {
        if (!q || q.trim() === '') return await reply('❌ Please provide a search term! (e.g., Albert Einstein)');
        
        await reply(`🔍 Searching Wikipedia for *${q}*...`);
        
        // Wikipedia API endpoints
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&utf8=1`;
        
        // Search for articles
        const searchResponse = await axios.get(searchUrl);
        const searchResults = searchResponse.data.query.search;
        
        if (!searchResults || searchResults.length === 0) {
            return await reply(`❌ No Wikipedia results found for: *${q}*`);
        }
        
        // Get the first result
        const firstResult = searchResults[0];
        const pageId = firstResult.pageid;
        
        // Get page content and image
        const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=1&explaintext=1&piprop=original&pageids=${pageId}&format=json`;
        const contentResponse = await axios.get(contentUrl);
        const pageData = contentResponse.data.query.pages[pageId];
        
        // Extract information
        const title = pageData.title;
        const extract = pageData.extract;
        const thumbnail = pageData.original ? pageData.original.source : null;
        
        // Create formatted summary (limiting to 400 characters)
        let summary = extract;
        if (summary.length > 400) {
            summary = summary.substring(0, 400) + '...';
        }
        
        // Prepare the caption
        const caption = `
📚 *CYBER-X AI WIKIPEDIA SEARCH* 📚

*Title*: ${title}

*Summary*:
${summary}

*Read more*: https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}

𝐌𝐚𝐝𝐞 𝐛𝐲 *C_Y_B_E_R*
>CYBER-X AI
`;
        
        // Send with image if available
        if (thumbnail) {
            await robin.sendMessage(
                from,
                {
                    image: { url: thumbnail },
                    caption: caption
                },
                { quoted: mek }
            );
        } else {
            // If no image available, send default image
            await robin.sendMessage(
                from,
                {
                    image: {
                        url: "https://raw.githubusercontent.com/CyberX1367/Bot-Media/refs/heads/main/wiki-img.jpeg"
                    },
                    caption: caption
                },
                { quoted: mek }
            );
        }
        
        // Offer more results if there are any
        if (searchResults.length > 1) {
            let moreResults = '📋 *More related articles*:\n';
            for (let i = 1; i < Math.min(searchResults.length, 5); i++) {
                moreResults += `\n${i+1}. ${searchResults[i].title}`;
            }
            await reply(moreResults);
        }
        
    } catch (error) {
        console.error('Error in Wikipedia search:', error);
        await reply('❌ An error occurred while searching Wikipedia. Please try again later.');
    }
});
