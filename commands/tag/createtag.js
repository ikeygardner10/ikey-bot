/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const txtFormatter = require('../../functions/txtFormatter.js');
const shortid = require('shortid');
const fileDownload = require('../../functions/fileDownload.js');

module.exports = {
	config: {
		name: 'createtag',
		aliases: ['ct', 'ctag'],
		usage: '<tag name> <tag content> <image>',
		cooldown: 5,
		category: 'tag',
		permissions: '',
		args: false,
		description: 'Create a tag, global or server',
	},
	execute: async (client, message, args) => {

		let [tag, ...restArgs] = args; let content = restArgs.join(' ');
		let attachment = message.attachments; const config = client.config;
		if(!tag) return message.channel.send('`Invalid tag (NO TAG NAME)`'); if(!content && !message.attachments.first()) return message.channel.send('`Invalid Tag (NO TAG CONTENT)`');
		if(tag.length > 30) return message.channel.send('`Invalid tag (MAX. 30 CHAR TAG NAME)`'); if(content.length > 1950) return message.channel.send('`Invalid tag (MAX. 1950 CHAR CONTENT)`');
		const ntn = txtFormatter(tag); const ntc = txtFormatter(content);
		let fileName; const filePath = 'D:/images/tags/'; let URI;

		const checkGlobal = 'SELECT `tag` FROM `tags` WHERE BINARY `tag`=? AND `guildID` IS NULL;';
		const checkServer = 'SELECT `tag` FROM `tags` WHERE BINARY `tag`=? AND `guildID`=?;';
		let addGlobal = 'INSERT INTO `tags` (`tag`, `content`, `userID`, `guildCreated`) VALUES (?, ?, ?, ?);'; let globalData = [ntn, ntc, message.author.id, message.guild.id];
		let addServer = 'INSERT INTO `tags` (`tag`, `content`, `userID`, `guildID`) VALUES (?, ?, ?, ?);'; let serverData = [ntn, ntc, message.author.id, message.guild.id];

		if(attachment.size > 0) {
			if(attachment.size > 1) return message.channel.send('`Invalid attachment (MAX. 1 (LIMIT INC. SOON))`');
			if(attachment.first().size > 8388608) return message.channel.send('`Invalid attachment (MAX. 8MB)`');

			attachment = message.attachments.first().name;
			const extension = attachment.substring(attachment.lastIndexOf('.'), attachment.length);
			switch(extension) {
			case '.png': case '.gif': case '.jpg': case '.jpeg': case '.mp4': case '.webm': case '.mp3': case '.wav':
				break;
			default:
				if(message.author.id !== config.ownerID) return message.channel.send('`Invalid attachment (PNG/GIF/JPG/WEBM/MP4 ONLY)`');
			}
			fileName = `${shortid.generate()}${extension}`; URI = message.attachments.first().url;
			addGlobal = 'INSERT INTO `tags` (`tag`, `content`, `imageURL`, `userID`, `guildCreated`) VALUES (?, ?, ?, ?, ?)'; globalData = [ntn, ntc, filePath + fileName, message.author.id, message.guild.id];
			addServer = 'INSERT INTO `tags` (`tag`, `content`, `imageURL`, `userID`, `guildID`) VALUES (?, ?, ?, ?, ?)'; serverData = [ntn, ntc, filePath + fileName, message.author.id, message.guild.id];
		}

		const SQLpool = client.conPool.promise();
		const [globalRows] = await SQLpool.query(checkGlobal, [ntn]);
		console.info(`[CREATE TAG] Querying database for global tag: ${ntn}`);
		if(globalRows[0] === undefined) {
			console.info(`[CREATE TAG] No global tag found: ${ntn}`);
			if(message.attachments.size > 0) {
				console.info(`[CREATE TAG] Global tag file attached, downloading: ${fileName}`);
				fileDownload(URI, fileName, filePath);
			}
			console.info(`[CREATE TAG] Adding global tag: ${ntn}`);
			await SQLpool.execute(addGlobal, globalData)
				.then(() => {
					console.success(`[CREATE TAG] Added global tag: ${ntn}`);
					return message.channel.send(`:scroll: Global tag **${ntn}** added`);
				}).catch(async (error) => {
					console.error(`[CREATE TAG] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		} else {
			console.info(`[CREATE TAG] Global tag found: ${ntn}, not adding`);
			const [serverRows] = await SQLpool.query(checkServer, [ntn, message.guild.id]);
			console.info(`[CREATE TAG] Querying database for server tag: ${ntn}`);
			if(serverRows[0] === undefined) {
				console.info(`[CREATE TAG] No server tag found: ${ntn}`);
				if(message.attachments.size > 0) {
					console.info(`[CREATE TAG] Server tag file attached, downloading: ${fileName}`);
					fileDownload(URI, fileName, filePath);
				}
				console.info(`[CREATE TAG] Adding server tag: ${ntn}`);
				await SQLpool.execute(addServer, serverData)
					.then(() => {
						console.success(`[CREATE TAG] Added server tag: ${ntn}`);
						return message.channel.send(`:scroll: Server tag **${ntn}** added`);
					}).catch(async (error) => {
						console.error(`[CREATE TAG] ${error.stack}`);
						return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
					});
			} else {
				console.info(`[CREATE TAG] Both tag slots in use, failed to add tag: ${ntn}`);
				return message.channel.send(`:lock: Tag **${ntn}** in use`);
			}
		}
	} };