/* eslint-disable no-unused-vars */
// Grab required modules
const fs = require('fs');
const { promisify } = require('util');

module.exports = {
	config: {
		name: 'cutie',
		aliases: ['hentai', 'cuties'],
		usage: '',
		cooldown: 3,
		category: 'nsfw',
		permissions: '',
		args: false,
		nsfw: true,
		description: 'Sends a random NSFW image',
	},
	execute: async (client, message, args) => {

		const readfile = promisify(fs.readfile); const dir = await readfile(JSON.parse('./data/temp/cutie.json'));
		const file = dir[(Math.floor(Math.random() * dir.length))];

		try {
			return message.channel.send({ files: [{ attachment: './images/Cutie/' + file, name: file }] });
		} catch(error) {
			console.error(`[CUTIE CMD] ${error.stack}`);
			return message.channel.send(`**:exclamation: An error occured:**\`\`\`${error.stack}\`\`\``);
		}
	} };