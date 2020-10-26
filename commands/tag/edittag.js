/* eslint-disable no-unused-vars */
const fs = require('fs-extra');
const txtFormatter = require('../../functions/txtFormatter.js');
const shortid = require('shortid');
const fileDownload = require('../../functions/fileDownload.js');

module.exports = {
	config: {
		name: 'edittag',
		aliases: ['et', 'etag'],
		usage: '<tag name> <tag content> <image optional>',
		cooldown: 5,
		category: 'tag',
		permissions: '',
		args: true,
		description: '\nEdit a server tag\nEdit a global tag',
	},
	execute: async (client, message, args) => {

		const [tag, ...restArgs] = args; const content = restArgs.join(' '); const config = client.config;
		let attachment = message.attachments; const imageDelete = fs.unlink;
		if(!tag) return message.channel.send('`Invalid tag (NO TAG NAME)`'); if(!content && !message.attachments.first()) return message.channel.send('`Invalid Tag (NO TAG CONTENT)`');
		if(tag.length > 30) return message.channel.send('`Invalid tag (MAX. 30 CHAR TAG NAME)`'); if(content.length > 1950) return message.channel.send('`Invalid tag (MAX. 1950 CHAR CONTENT)`');
		const ntn = txtFormatter(tag); const ntc = txtFormatter(content) || '';
		let fileName; const filePath = './images/tags/'; let URI;

		const checkGlobal = 'SELECT `tag`, `userID`, `imageURL` FROM `tags` WHERE BINARY `tag`=? AND `guildID` IS NULL';
		const checkServer = 'SELECT `tag`, `userID`, `imageURL` FROM `tags` WHERE BINARY `tag`=? AND `guildID`=?';
		let updateGlobal = 'UPDATE `tags` SET `content`=?, `imageURL`= NULL WHERE BINARY `tag`=? AND `guildID` IS NULL'; let globalData = [ntc, ntn];
		let updateServer = 'UPDATE `tags` SET `content`=?, `imageURL`= NULL WHERE BINARY `tag`=? AND `guildID`=?'; let serverData = [ntc, ntn, message.guild.id];

		if(attachment.size > 0) {
			if(attachment.size > 1) return message.channel.send('`Invalid attachment (MAX. 1)`');
			if(attachment.first().size > 8388608) return message.channel.send('`Invalid attachment (MAX. 8MB)`');

			attachment = message.attachments.first().name;
			const extension = attachment.substring(attachment.lastIndexOf('.'), attachment.length);
			switch(extension) {
			case '.png': case '.gif': case '.jpg': case '.jpeg': case '.mp4': case '.webm':
				break;
			default:
				if(message.author.id !== config.ownerID) return message.channel.send('`Invalid attachment (PNG/GIF/JPG/WEBM/MP4 ONLY)`');
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
			if(serverRows[0].userID !== message.author.id) return message.channel.send('`Invalid (TAG OWNER ONLY)`');
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
					return message.channel.send(`:scroll: Server tag **${ntn}** edited`);
				}).catch(async (error) => {
					console.error(`[EDIT TAG] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		} else {
			console.info(`[EDIT TAG] No server tag found: ${ntn}`);
			const [globalRows] = await SQLpool.query(checkGlobal, [ntn]);
			console.info(`[EDIT TAG] Querying database for global tag: ${ntn}`);
			if(globalRows[0] !== undefined) {
				console.info(`[EDIT TAG] Global tag found: ${ntn}`);
				if(globalRows[0].userID !== message.author.id) return message.channel.send('`Invalid (TAG OWNER ONLY)`');
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
						return message.channel.send(`:scroll: Global tag **${ntn}** edited`);
					}).catch(async (error) => {
						console.error(`[EDIT TAG] ${error.stack}`);
						return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
					});
			} else {
				console.info(`[EDIT TAG] No tag found, failed to edit tag: ${ntn}`);
				return message.channel.send(`:mag: Tag **${ntn}** not found`);
			}
		}
	} };