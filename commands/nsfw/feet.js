/* eslint-disable no-unused-vars */
// Grab required modules
const fs = require('fs-extra');
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

		fs.readJson('./data/temp/feet.json')
			.then((files) => {
				const file = files[(Math.floor(Math.random() * files.length))];
				return message.channel.send({ files: [{ attachment: 'D:/images/Feet/' + file, name: file }] });
			}).catch((error) => {
				console.error(`[CUTIE CMD] ${error.stack}`);
				return message.channel.send(`**:exclamation: An error occured:**\`\`\`${error.stack}\`\`\``);
			});
	} };