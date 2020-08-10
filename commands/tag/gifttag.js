/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const txtFormatter = require('../../functions/txtFormatter.js');

module.exports = {
	config: {
		name: 'gifttag',
		aliases: ['gt', 'gtag'],
		usage: '<@user> <tag name>',
		cooldown: 5,
		category: 'tag',
		permissions: '',
		args: false,
		description: 'Gift tag ownership to another user',
	},
	execute: async (client, message, args) => {

		const member = message.guild.member(message.mentions.users.first()); if(!member) return message.channel.send('`Invalid (NO USER)`');
		const tag = args[1]; if(!tag) return message.channel.send('`Invalid tag (NO TAG NAME)`');
		const ntn = txtFormatter(tag);

		const checkGlobal = 'SELECT `tag`, `userID` FROM `tags` WHERE BINARY `tag`=? AND `guildID` IS NULL';
		const checkServer = 'SELECT `tag`, `userID` FROM `tags` WHERE BINARY `tag`=? AND `guildID`=?';
		const giveGlobal = 'UPDATE `tags` SET `userID`=? WHERE BINARY `tag`=? AND `guildID` IS NULL';
		const giveServer = 'UPDATE `tags` SET `userID`=? WHERE BINARY `tag`=? AND `guildID`=?';

		const SQLpool = client.conPool.promise();
		const [serverRows] = await SQLpool.query(checkServer, [ntn, message.guild.id]);
		console.info(`[GIFT TAG] Querying database for server tag: ${ntn}`);
		if(serverRows[0] !== undefined) {
			console.info(`[GIFT TAG] Server tag found: ${ntn}`);
			if(serverRows[0].userID !== message.author.id) return message.channel.send('`Invalid (TAG OWNER ONLY)`');
			console.info(`[GIFT TAG] Gifting server tag: ${ntn}`);
			await SQLpool.execute(giveServer, [member.id, ntn, message.guild.id])
				.then(() => {
					console.success(`[GIFT TAG] Gifted server tag: ${ntn}`);
					return message.channel.send(`:gift: Server tag **${ntn}** gifted`);
				}).catch(async (error) => {
					console.error(`[GIFT TAG] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		} else {
			console.info(`[GIFT TAG] No server tag found: ${ntn}`);
			const [globalRows] = await SQLpool.query(checkGlobal, [ntn]);
			console.info(`[GIFT TAG] Querying database for global tag: ${ntn}`);
			if(globalRows[0] !== undefined) {
				console.info(`[GIFT TAG] Global tag found: ${ntn}`);
				if(globalRows[0].userID !== message.author.id) return message.channel.send('`Invalid (TAG OWNER ONLY)`');
				console.info(`[GIFT TAG] Gifting global tag: ${ntn}`);
				await SQLpool.execute(giveGlobal, [member.id, ntn])
					.then(() => {
						console.success(`[GIFT TAG] Gifted global tag: ${ntn}`);
						return message.channel.send(`:gift: Global tag **${ntn}** gifted`);
					}).catch(async (error) => {
						console.error(`[GIFT TAG] ${error.stack}`);
						return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
					});
			} else {
				console.info(`[GIFT TAG] No tag found, failed to gift tag: ${ntn}`);
				return message.channel.send(`:mag: Tag **${ntn}** not found`);
			}
		}
	} };
