/* eslint-disable no-unused-vars */
// Grab required modules
const fs = require('fs');
const { promisify } = require('util');

module.exports = {
	config: {
		name: 'feet',
		noalias: 'No Aliases',
		aliases: [],
		usage: '',
		cooldown: 3,
		category: 'nsfw',
		permissions: '',
		args: false,
		nsfw: true,
		description: 'Sends a random feet image',
	},
	execute: async (client, message, args) => {

		const readfile = promisify(fs.readdir); const dir = await readfile('./data/temp/feet.json');
		const file = dir[(Math.floor(Math.random() * dir.length))];

		try {
			return message.channel.send({ files: [{ attachment: './images/Feet/' + file, name: file }] });
		} catch(error) {
			console.error(`[FEET CMD] ${error.stack}`);
			return message.channel.send(`**:exclamation: An error occured:**\`\`\`${error.stack}\`\`\``);
		}
	} };