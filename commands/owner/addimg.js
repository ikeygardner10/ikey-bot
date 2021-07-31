/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const shortid = require('shortid');
const fileDownload = require('../../functions/fileDownload.js');

module.exports = {
	config: {
		name: 'addimg',
		aliases: ['ai'],
		usage: '<command> + image attachment',
		cooldown: 5,
		category: 'owner',
		permissions: 'Bot Owner',
		args: true,
		description: 'Add an image to a command, commands include:\nChoke, Crazimo, Cutie, DodgeSuccess, DodgeFail, Feet, Fuck\nHandhold, Hug, Kiss, Pat, Punch, Shoot, Slap, Spank, Stab, Tights, Waifu',
	},
	execute: async (client, message, args) => {

		const dirs = {
			choke: './images/Choke/', crazimo: './images/Crazimo', cutie: './images/Cutie/',
			dodgesuccess: './images/DodgeSuccess/', dodgefail: './images/DodgeFail/',
			feet: './images/Feet/', fuck: './images/Fuck/', handhold: './images/Handhold/',
			hug: './images/Hug/', kiss: './images/Kiss', pat: './images/Pat/', punch: './images/Punch/',
			shoot: './images/Shoot/', slap: './images/Slap/', spank: './images/Spank/',
			stab: './images/Stab/', tights: './images/Tights/', waifu: './images/Waifu',
		};
		const attachment = message.attachments.first(); if(!attachment) return message.lineReply('No image attached');
		const dir = args[0]; if(!dir) return message.lineReply('No cmd to add image to'); const newDir = dir.toLowerCase();

		const extension = attachment.name.substring(attachment.name.lastIndexOf('.'), attachment.name.length);
		const URI = message.attachments.first().url;
		const filePath = `${dirs[newDir]}`;
		const fileName = `${shortid.generate()}${extension}`;
		switch(extension) {
		case '.png': case '.gif': case '.jpg': case '.jpeg':
			break;
		default:
			return message.lineReply('`Invalid attachment (PNG/GIF/JPG ONLY)`');
		}
		if(filePath === 'undefined') return message.lineReply('Invalid folder');

		return fileDownload(URI, fileName, filePath)
			.then(() => {
				return message.lineReply('Image added :white_check_mark:');
			}).catch((error) => {
				console.error(`[ADD IMG] ${error.stack}`);
				return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			});


	},
};