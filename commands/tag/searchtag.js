/* eslint-disable brace-style */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const txtFormatter = require('../../functions/txtFormatter.js');

module.exports = {
	config: {
		name: 'searchtag',
		aliases: ['st', 'listtag', 'lt'],
		usage: '<tag name>/<@user>/server',
		cooldown: 5,
		category: 'tag',
		permissions: '',
		args: false,
		description: '\nSearch for an individual tag\nList users tags\nList server tags',
	},
	execute: async (client, message, args) => {

		checkUser = 'SELECT `tag`, `guildID` FROM `tags` WHERE `userID`=?';
		checkServer = 'SELECT `tag` FROM `tags` WHERE `guildID`=?';
		checkTag = 'SELECT `tag`, `userID`, `guildID` FROM `tags` WHERE BINARY `tag`=?';
		checkSelf = 'SELECT `tag`, `guildID` FROM `tags` WHERE `userID`=?';

		const SQLpool = client.conPool.promise(); let tags;

		if(message.mentions.users.first()) {
			try {
				const [userRows] = await SQLpool.query(checkUser, [message.mentions.users.first().id]);
				console.info(`[SEARCH TAG] Querying for user ${message.mentions.users.first().id} tags`);
				if(userRows[0] === undefined) {
					console.info('[SEARCH TAG] No user tags found');
					return message.channel.send(':mag: No user tags found');
				} else {
					tags = [];
					console.info('[SEARCH TAG] Pushing tags');
					await userRows.forEach(tag => {
						const ntn = txtFormatter(tag.tag);
						if(tag.guildID !== null) {
							tags.push(ntn + ' (Server)');
						} else {
							tags.push(ntn);
						}
					});
					if(tags.length === 0) {
						console.info(`[SEARCH TAG] No tags found: ${ntn}`);
						return message.channel.send(`:mag: No tags **${ntn}** found`);
					} else {
						message.channel.send(`:scroll: **${message.mentions.users.first().tag}'s tags**\n\n${tags.join('\n')}`, { split: true });
						return console.success('[SEARCH TAG] Found user tags, sent message');
					}
				}
			} catch(error) {
				console.error(`[SEARCH TAG] ${error.stack}`);
				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			}
		}

		if(!args[0]) {
			try {
				const [selfRows] = await SQLpool.query(checkSelf, [message.author.id]);
				console.info(`[SEARCH TAG] Querying for user ${message.author.id} tags`);
				if(selfRows[0] === undefined) {
					console.info('[SEARCH TAG] No user tags found');
					return message.channel.send(':mag: You have no tags');
				} else {
					tags = [];
					console.info('[SEARCH TAG] Pushing tags');
					await selfRows.forEach(tag => {
						let ntn = txtFormatter(tag.tag);
						if(tags.includes(ntn)) return;
						if(tag.guildID !== null) {
							return tags.push(ntn + ' (Server)');
						} else {
							return tags.push(ntn);
						}
					});
					if(tags.length === 0) {
						console.info(`[SEARCH TAG] No tags found: ${ntn}`);
						return message.channel.send(`:mag: No tags **${ntn}** found`);
					} else {
						message.channel.send(`**:scroll: ${message.member.user.tag}'s tags**\n\n${tags.join('\n')}`, { split: true });
						return console.success('[SEARCH TAG] Found user tags, sent message');
					}
				}
			} catch(error) {
				console.error(`[SEARCH TAG] ${error.stack}`);
				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			}
		}

		if(args[0] === 'server') {
			try {
				const [serverRows] = await SQLpool.query(checkServer, [message.guild.id]);
				console.info(`[SEARCH TAG] Querying for server ${message.guild.id} tags`);
				if(serverRows[0] === undefined) {
					console.info('[SEARCH TAG] No server tags found');
					return message.channel.send(':mag: No server tags found');
				} else {
					tags = [];
					console.info('[SEARCH TAG] Pushing tags');
					await serverRows.forEach(tag => {
						const ntn = txtFormatter(tag.tag);
						tags.push(ntn);
					});
					if(tags.length === 0) {
						console.info(`[SEARCH TAG] No tags found: ${ntn}`);
						return message.channel.send(`:mag: No tags **${ntn}** found`);
					} else {
						message.channel.send(`**:scroll: ${message.guild.name}'s tags**\n\n${tags.join('\n')}`, { split: true });
						return console.success('[SEARCH TAG] Found server tags, sent message');
					}
				}
			} catch(error) {
				console.error(`[SEARCH TAG] ${error.stack}`);
				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			}
		}

		else {
			try {
				let ntn = txtFormatter(args[0]);
				const [tagRows] = await SQLpool.query(checkTag, [ntn]);
				if(tagRows[0] === undefined) {
					console.info(`[SEARCH TAG] No tags found: ${ntn}`);
					return message.channel.send(`:mag: No tags **${ntn}** found`);
				} else {
					tags = [];
					console.info('[SEARCH TAG] Pushing tags');
					await tagRows.forEach(tag => {
						ntn = txtFormatter(tag.tag);
						let user = client.users.cache.get(tag.userID);
						if(tag.guildID !== null) {
							if(tag.guildID !== message.guild.id) return;
							tags.push(`${ntn} (Server)\nOwner: ${user.tag}`);
						} else {
							tags.push(`${ntn}\nOwner: ${user.tag}`);
						}
					});
					if(tags.length === 0) {
						console.info(`[SEARCH TAG] No tags found: ${ntn}`);
						return message.channel.send(`:mag: No tags **${ntn}** found`);
					} else {
						message.channel.send(`**:scroll: ${ntn} details**\n\n${tags.join('\n\n')}`);
						return console.success(`[SEARCH TAG] Found tag ${ntn}, sent message`);
					}
				}
			} catch(error) {
				console.error(`[SEARCH TAG] ${error.stack}`);
				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			}
		}
	} };