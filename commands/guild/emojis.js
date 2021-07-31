/* eslint-disable no-shadow */
/* eslint-disable prefer-const */
const sendEmbed = require('../../functions/sendEmbed.js');

module.exports = {
	config: {
		name: 'emojis',
		aliases: ['emoji'],
		usage: '',
		cooldown: 8,
		category: 'guild',
		permissions: 'None',
		args: false,
		description: 'View server emojis',
	},
	execute: async (client, message) => {

		// Grab server emoji, define emoji array and embed author
		const emojis = message.guild.emojis.cache;
		const emojiArray = [];
		const author = `${message.guild.name}'s emojis`;

		// Wait for all emojis to be pushed to the array
		await emojis.forEach(emoji => {
			emojiArray.push(emoji);
		});

		// If no server emoji, return, else pass to embed function
		if(!emojiArray) return message.lineReply('`Invalid (NO SERVER EMOJI)`');
		return sendEmbed(message, emojiArray, author, 44, ' ');
	} };
