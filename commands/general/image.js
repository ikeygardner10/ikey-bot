/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');
const { image_search } = require('duckduckgo-images-api');
const paginationEmbed = require('../../functions/embedPagination');

module.exports = {
	config: {
		name: 'image',
		aliases: ['is', 'img', 'im', 'i'],
		usage: '<search query>',
		cooldown: 10,
		category: 'general',
		permissions: '',
		args: true,
		description: 'Search for images on DuckDuckGo\nSafe Search is off in NSFW channels',
	},
	execute: async (client, message, args) => {

		const toSearch = args.join(' ');
		if(!toSearch) return message.channel.send('`Invalid search (NOTHING TO SEARCH)`');

		const embeds = [];
		const timeout = 1000 * 30;
		const emojiList = ['⏪', '⬅️', '➡️', '⏩', '⏹️'];
		const mod = message.channel.nsfw ? false : true;
		const images = await image_search({ query: toSearch, moderate: mod, iterations: 1, retries: 1 });
		if(images.length === 0) return message.channel.send('`Invalid (NO RESULTS)`');
		if(images.error && images.error.code === 403) return message.channel.send('`Invalid (SEARCH QUOTA LIMIT)');

		for(const [i, value] of images.entries()) {
			embeds.push(new MessageEmbed().setDescription(`**'${toSearch}' images:**`).setImage(value.image).setColor(0xFFFFFA));
		}

		return paginationEmbed(message, embeds, emojiList, timeout);

	} };