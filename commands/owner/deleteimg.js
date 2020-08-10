/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const { promisify } = require('util');
const fs = require('fs');

module.exports = {
	config: {
		name: 'deleteimg',
		aliases: ['di'],
		usage: '<dir> <img name>',
		cooldown: 5,
		category: 'owner',
		permissions: 'Bot Owner',
		args: true,
		description: 'Delete an image from directory\nCutie\nFeet\nFuck\nTights',
	},
	execute: async (client, message, args) => {

		let dirs = {
			cutie: './images/Cutie/', feet: './images/Feet/',
			fuck: './images/Fuck/', tights: './images/Tights',
		};

		const dir = args[0]; if(!dir) return message.channel.send('No dir'); const newDir = dir.toLowerCase();
		const imageName = args[1]; if(!imageName) return message.channel.send('No img name');
		const imageDelete = promisify(fs.unlink);

		return imageDelete(`${dirs[newDir]}${imageName}`)
			.then(() => {
				console.success(`[DEL IMG] Successfully deleted image: ${dirs[newDir]}${imageName}`);
				return message.channel.send(`${imageName} deleted! :white_check_mark:`);
			}).catch((error) => {
				console.error(`[DEL IMG] ${error.stack}`);
				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			});
	},
};