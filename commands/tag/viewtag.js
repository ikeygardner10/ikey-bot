/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const fs = require('fs');
const { promisify } = require('util');
const txtFormatter = require('../../functions/txtFormatter.js');

module.exports = {
	config: {
		name: 'viewtag',
		aliases: ['t', 'vt', 'vtag'],
		usage: '<tag name>',
		cooldown: 3,
		category: 'tag',
		permissions: '',
		args: true,
		description: 'View a tag',
	},
	execute: async (client, message, args) => {

		const tag = args[0]; let filePath = './images/tags/'; let fileName;
		if(!tag) return message.channel.send('`Invalid tag (NO TAG NAME)`'); if(tag.length > 30) return message.channel.send('`Invalid tag (MAX. 30 CHAR TAG NAME)`');
		const ntn = txtFormatter(tag); const fileGrab = promisify(fs.access); let fileURL;

		const checkGlobal = 'SELECT `tag`, `content`, `imageURL` FROM `tags` WHERE BINARY `tag`=? AND `guildID` IS NULL';
		const checkServer = 'SELECT `tag`, `content`, `imageURL` FROM `tags` WHERE BINARY `tag`=? AND `guildID`=?';

		const SQLpool = client.conPool.promise();
		const [serverRows] = await SQLpool.query(checkServer, [ntn, message.guild.id]);
		console.info(`[VIEW TAG] Querying database for server tag: ${ntn}`);
		if(serverRows[0] !== undefined) {
			try {
				if(serverRows[0].imageURL !== null) {
					fileURL = serverRows[0].imageURL; fileName = fileURL.substring(fileURL.lastIndexOf('/') + 1, fileURL.length);
					await fileGrab(fileURL)
						.then(() => {
							console.success(`[VIEW TAG] Server tag sent: ${ntn}`);
							return message.channel.send(serverRows[0].content, { files: [{ attachment: fileURL, name: fileName }] });
						})
						.catch((error) => {
							console.error(`[VIEW TAG] ${error.stack}`);
							console.error(`[VIEW TAG] Server tag image ${serverRows[0].imageURL} corrupted`);
							console.success(`[VIEW TAG] Server tag sent: ${ntn}`);
							return message.channel.send(serverRows[0].content + '\n\n*(file corrupted)*');
						});
				} else {
					console.success(`[VIEW TAG] Server tag sent: ${ntn}`);
					return message.channel.send(serverRows[0].content);
				}
			} catch(error) {
				console.error(`[VIEW TAG] ${error.stack}`);
				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			}
		} else {
			const [globalRows] = await SQLpool.query(checkGlobal, [ntn]);
			console.info(`[VIEW TAG] Querying database for global tag: ${ntn}`);
			if(globalRows[0] !== undefined) {
				try {
					if(globalRows[0].imageURL !== null) {
						fileURL = globalRows[0].imageURL; fileName = fileURL.substring(fileURL.lastIndexOf('/') + 1, fileURL.length);
						await fileGrab(fileURL)
							.then(() => {
								console.success(`[VIEW TAG] Global tag sent: ${ntn}`);
								return message.channel.send(globalRows[0].content, { files: [{ attachment: fileURL, name: fileName }] });
							})
							.catch((error) => {
								console.error(`[VIEW TAG] ${error.stack}`);
								console.error(`[VIEW TAG] Global tag image ${globalRows[0].imageURL} corrupted`);
								console.success(`[VIEW TAG] Global tag sent: ${ntn}`);
								return message.channel.send(globalRows[0].content + '\n\n*(file corrupted)*');
							});
					} else {
						console.success(`[VIEW TAG] Global tag sent: ${ntn}`);
						return message.channel.send(globalRows[0].content);
					}
				} catch(error) {
					console.error(`[VIEW TAG] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				}
			} else {
				console.info(`[VIEW TAG] No tag found: ${ntn}`);
				return message.channel.send(`:mag: No tag **${ntn}** found`);
			}
		}

	},
};