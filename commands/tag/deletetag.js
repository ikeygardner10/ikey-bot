/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const fs = require('fs-extra');
const { promisify } = require('util');
const txtFormatter = require('../../functions/txtFormatter.js');
const botAdmins = require('../../data/owner/botAdmins.json');

module.exports = {
	config: {
		name: 'deletetag',
		aliases: ['dt', 'dtag'],
		usage: '<tag name>',
		cooldown: 5,
		category: 'tag',
		permissions: '',
		args: false,
		description: '\nDelete a server tag (tag owner or server admin)\nDelete a global tag (tag owner)',
	},
	execute: async (client, message, args) => {

		const tag = args[0];
		if(!tag) return message.lineReply('`Invalid (NO TAG NAME)`');
		if(tag.length > 30) return message.lineReply('`Invalid tag (MAX. 30 CHAR TAG NAME)`');

		const ntn = txtFormatter(tag);
		const fileDelete = fs.unlink;

		const checkGlobal = 'SELECT * FROM `tags` WHERE BINARY `tag`=? AND `guildID` IS NULL';
		const checkServer = 'SELECT * FROM `tags` WHERE BINARY `tag`=? AND `guildID`=?';
		const deleteGlobal = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `tags` WHERE BINARY `tag`=? AND `guildID` IS NULL';
		const deleteServer = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `tags` WHERE BINARY `tag`=? AND `guildID`=?';

		const SQLpool = client.conPool.promise();
		const [serverRows] = await SQLpool.query(checkServer, [ntn, message.guild.id]);
		console.info(`[DELETE TAG] Querying database for server tag: ${ntn}`);
		if(serverRows[0] !== undefined) {
			console.info(`[DELETE TAG] Server tag found: ${ntn}`);
			if(serverRows[0].userID !== message.author.id && !message.member.hasPermission('ADMINISTRATOR') && message.author.id !== client.config.ownerID) return message.lineReply('`Invalid (TAG OWNER/SERVER ADMIN ONLY)`');
			if(serverRows[0].imageURL !== null) {
				console.info(`[DELETE TAG] Server tag file found, deleting: ${serverRows[0].imageURL}`);
				fileDelete(serverRows[0].imageURL)
					.then(async () => console.success(`[DELETE TAG] Server tag file deleted: ${serverRows[0].imageURL}`))
					.catch(async (error) => console.error(`[DELETE TAG] ${error.stack}`));
			}
			await SQLpool.query(deleteServer, [ntn, message.guild.id])
				.then(() => {
					console.success(`[DELETE TAG] Deleted server tag: ${ntn}`);
					return message.lineReply(`:wastebasket: Server tag **${ntn}** deleted`);
				}).catch(async (error) => {
					console.error(`[DELETE TAG] ${error.stack}`);
					return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		}
		else {
			console.info(`[DELETE TAG] No server tag found: ${ntn}`);
			const [globalRows] = await SQLpool.query(checkGlobal, [ntn]);
			console.info(`[DELETE TAG] Querying database for global tag: ${ntn}`);
			if(globalRows[0] !== undefined) {
				if(globalRows[0].userID !== message.author.id && !botAdmins.includes(message.author.id) && message.author.id !== client.config.ownerID) return message.lineReply('`Invalid (TAG OWNER/BOT ADMINS ONLY)`');
				if(globalRows[0].imageURL !== null) {
					console.info(`[DELETE TAG] Global tag file found, deleting: ${globalRows[0].imageURL}`);
					fileDelete(globalRows[0].imageURL)
						.then(async () => console.success(`[DELETE TAG] Global tag file deleted: ${globalRows[0].imageURL}`))
						.catch(async (error) => console.error(`[DELETE TAG] ${error.stack}`));
				}
				await SQLpool.query(deleteGlobal, [ntn])
					.then(() => {
						console.success(`[DELETE TAG] Deleted global tag: ${ntn}`);
						return message.lineReply(`:wastebasket: Global tag **${ntn}** deleted`);
					}).catch(async (error) => {
						console.error(`[DELETE TAG] ${error.stack}`);
						return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
					});
			}
			else {
				console.info(`[DELETE TAG] No tag found, failed to delete tag: ${ntn}`);
				return message.lineReply(`:mag: Tag **${ntn}** not found`);
			}
		}
	} };