/* eslint-disable no-unused-vars */
const fs = require('fs-extra');
const txtFormatter = require('../../functions/txtFormatter.js');
const shortid = require('shortid');
const fileDownload = require('../../functions/fileDownload.js');
const botAdmins = require('../../data/owner/botAdmins.json');

module.exports = {
	config: {
		name: 'edittag',
		aliases: ['et', 'etag'],
		usage: '<tag name> <tag content> <image optional>',
		cooldown: 5,
		category: 'tag',
		permissions: '',
		args: true,
		description: 'Edit a server tag\nEdit a global tag',
	},
	execute: async (client, message, args) => {

		const imageDelete = fs.unlink;

		const [tag, ...restArgs] = args;
		const content = restArgs.join(' ');
		let attachment = message.attachments;
		if(!tag) return message.lineReply('`Invalid (NO TAG NAME)`');
		if(!content && !message.attachments.first()) return message.lineReply('`Invalid (NO TAG CONTENT)`');
		if(tag.length > 30) return message.lineReply('`Invalid (MAX. 30 CHAR TAG NAME)`');
		if(content.length > 1950) return message.lineReply('`Invalid (MAX. 1950 CHAR CONTENT)`');

		const ntn = txtFormatter(tag);
		const ntc = txtFormatter(content) || '';
		let fileName;
		const filePath = 'D:/images/tags/';
		let URI;

		const checkGlobal = 'SELECT `tag`, `userID`, `imageURL` FROM `tags` WHERE BINARY `tag`=? AND `guildID` IS NULL';
		const checkServer = 'SELECT `tag`, `userID`, `imageURL` FROM `tags` WHERE BINARY `tag`=? AND `guildID`=?';
		let updateGlobal = 'UPDATE `tags` SET `content`=?, `imageURL`= NULL WHERE BINARY `tag`=? AND `guildID` IS NULL';
		let updateServer = 'UPDATE `tags` SET `content`=?, `imageURL`= NULL WHERE BINARY `tag`=? AND `guildID`=?';

		let globalData = [ntc, ntn];
		let serverData = [ntc, ntn, message.guild.id];

		if(attachment.size > 0) {
			if(attachment.size > 1) return message.lineReply('`Invalid (MAX. 1 ATTACHMENT)`');
			if(attachment.first().size > 8388608) return message.lineReply('`Invalid (MAX. 8MB ATTACHMENT)`');

			attachment = message.attachments.first().name;
			const extension = attachment.substring(attachment.lastIndexOf('.'), attachment.length);
			switch(extension) {
			case '.png': case '.gif': case '.jpg': case '.jpeg': case '.mp4': case '.webm': case '.mp3': case '.wav': case '.mov':
				break;
			default:
				if(message.author.id !== client.config.ownerID) return message.lineReply('`Invalid (PNG/GIF/JPG/WEBM/MP3/WAV/MP4/MOV ONLY)`');
			}
			fileName = `${shortid.generate()}${extension}`; URI = message.attachments.first().url;
			updateGlobal = 'UPDATE `tags` SET `content`=?, `imageURL`=? WHERE BINARY `tag`=? AND `guildID` IS NULL'; globalData = [ntc, filePath + fileName, ntn];
			updateServer = 'UPDATE `tags` SET `content`=?, `imageURL`=? WHERE BINARY `tag`=? AND `guildID`=?'; serverData = [ntc, filePath + fileName, ntn, message.guild.id];
		}

		const SQLpool = client.conPool.promise();
		const [serverRows] = await SQLpool.query(checkServer, [ntn, message.guild.id]);
		console.info(`[EDIT TAG] Querying database for server tag: ${ntn}`);
		if(serverRows[0] !== undefined) {
			console.info(`[EDIT TAG] Server tag found: ${ntn}`);
			if(serverRows[0].userID !== message.author.id && !message.member.hasPermission('ADMINISTRATOR') && message.author.id !== client.config.ownerID) return message.lineReply('`Invalid (TAG OWNER/SERVER ADMIN ONLY)`');
			if(serverRows[0].imageURL !== null) {
				imageDelete(serverRows[0].imageURL)
					.then(async () => console.success(`[EDIT TAG] Old server tag file deleted: ${serverRows[0].imageURL}`))
					.catch(async (error) => console.error(`[EDIT TAG] ${error.stack}`));
			}
			if(message.attachments.size > 0) {
				console.info(`[EDIT TAG] Server tag file attached, downloading: ${fileName}`);
				fileDownload(URI, fileName, filePath);
			}
			console.info(`[EDIT TAG] Editing server tag: ${ntn}`);
			await SQLpool.execute(updateServer, serverData)
				.then(() => {
					console.success(`[EDIT TAG] Edited server tag: ${ntn}`);
					return message.lineReply(`:scroll: Server tag **${ntn}** edited`);
				}).catch(async (error) => {
					console.error(`[EDIT TAG] ${error.stack}`);
					return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		}
		else {
			console.info(`[EDIT TAG] No server tag found: ${ntn}`);
			const [globalRows] = await SQLpool.query(checkGlobal, [ntn]);
			console.info(`[EDIT TAG] Querying database for global tag: ${ntn}`);
			if(globalRows[0] !== undefined) {
				console.info(`[EDIT TAG] Global tag found: ${ntn}`);
				if(globalRows[0].userID !== message.author.id && !botAdmins.includes(message.author.id) && message.author.id !== client.config.ownerID) return message.lineReply('`Invalid (TAG OWNER/BOT ADMINS ONLY)`');
				if(globalRows[0].imageURL !== null) {
					imageDelete(globalRows[0].imageURL)
						.then(async () => console.success(`[EDIT TAG] Old global tag file deleted: ${globalRows[0].imageURL}`))
						.catch(async (error) => console.error(`[EDIT TAG] ${error.stack}`));
				}
				if(message.attachments.size > 0) {
					console.info(`[EDIT TAG] Global tag file attached, downloading: ${fileName}`);
					fileDownload(URI, fileName, filePath);
				}
				console.info(`[EDIT TAG] Editing global tag: ${ntn}`);
				await SQLpool.execute(updateGlobal, globalData)
					.then(() => {
						console.success(`[EDIT TAG] Edited global tag: ${ntn}`);
						return message.lineReply(`:scroll: Global tag **${ntn}** edited`);
					}).catch(async (error) => {
						console.error(`[EDIT TAG] ${error.stack}`);
						return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
					});
			}
			else {
				console.info(`[EDIT TAG] No tag found, failed to edit tag: ${ntn}`);
				return message.lineReply(`:mag: Tag **${ntn}** not found`);
			}
		}
	} };