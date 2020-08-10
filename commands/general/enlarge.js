const utf8 = require('utf8');
const emojiList = require('../../data/full-emoji-list.json');

module.exports = {
	config: {
		name: 'enlarge',
		aliases: ['e'],
		usage: '<emoji>',
		cooldown: 3,
		category: 'general',
		permissions: '',
		args: true,
		description: 'Enlarge an emoji',
	},
	execute: async (client, message, args) => {

		try {

			const emoji = args[0];
			if(!emoji.match(/<(.*?):(.*?):(.*?)>+/g)) return message.channel.send('Custom emotes only (work in progress)');
			const newemoji = emoji.replace(/<.*:/, '').slice(0, -1);
			let extension = '.png';
			if(emoji.match(/^(<a:)/)) extension = '.gif';
			const url = `https://cdn.discordapp.com/emojis/${newemoji}${extension}`;

			return message.channel.send({ files: [{ attachment: url, name: `${newemoji}${extension}` }] });

		} catch(error) {
			console.error(`[ENLARGE CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };