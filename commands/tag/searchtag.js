/* eslint-disable brace-style */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const txtFormatter = require('../../functions/txtFormatter.js');
const { MessageEmbed } = require('discord.js');

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

		checkUser = 'SELECT `tag`, `guildID` FROM `tags` WHERE `userID`=?;'; checkServer = 'SELECT `tag` FROM `tags` WHERE `guildID`=?;';
		checkTag = 'SELECT `tag`, `userID`, `guildID` FROM `tags` WHERE BINARY `tag`=?;'; checkSelf = 'SELECT `tag`, `guildID` FROM `tags` WHERE `userID`=?;';

		const SQLpool = client.conPool.promise(); let tagArray = []; let embedAuthor; let currentIndex = 0;

		const generateEmbed = start => {
			const current = tagArray.slice(start, start + 15);
			const stEmbed = new MessageEmbed()
				.setTimestamp()
				.setColor(0xFFFFFA)
				.setAuthor(embedAuthor)
				.setDescription(`Showing tags ${start + 1}-${start + current.length} out of ${tagArray.length}\n\n${current.join('\n')}\n`);

			return stEmbed;
		};

		const sendEmbed = () => {
			message.channel.send(generateEmbed(0)).then(msg => {
				if(tagArray.length <= 15) return;
				msg.react('➡️');
				const collector = msg.createReactionCollector((reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 60000 });
				currentIndex = 0;
				collector.on('collect', reaction => {
					msg.reactions.removeAll().then(async () => {
						reaction.emoji.name === '⬅️' ? currentIndex -= 15 : currentIndex += 15;
						msg.edit(generateEmbed(currentIndex));
						if(currentIndex !== 0) await msg.react('⬅️');
						if(currentIndex + 15 < tagArray.length) msg.react('➡️');
					});
				});
			});
		};

		if(message.mentions.users.first()) {
			try {
				const member = message.mentions.users.first();
				const [userRows] = await SQLpool.query(checkUser, [member.id]);
				console.info(`[SEARCH TAG] Querying for user ${member.id} tags`);
				if(userRows[0] === undefined) {
					console.info('[SEARCH TAG] No user tags found');
					return message.channel.send(':mag: No user tags found');
				} else {
					console.info('[SEARCH TAG] Pushing tags');
					await userRows.forEach(tag => {
						const ntn = txtFormatter(tag.tag);
						if(tag.guildID !== null) {
							tagArray.push(ntn + ' (Server)');
						} else {
							tagArray.push(ntn);
						}
					});
					if(tagArray.length === 0) {
						console.info(`[SEARCH TAG] No tags found: ${ntn}`);
						return message.channel.send(`:mag: No tags **${ntn}** found`);
					} else {
						embedAuthor = `${member.tag}'s tags`;
						sendEmbed();
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
					console.info('[SEARCH TAG] Pushing tags');
					await selfRows.forEach(tag => {
						let ntn = txtFormatter(tag.tag);
						if(tag.guildID !== null) {
							return tagArray.push(ntn + ' (Server)');
						} else {
							return tagArray.push(ntn);
						}
					});
					if(tagArray.length === 0) {
						console.info(`[SEARCH TAG] No tags found: ${ntn}`);
						return message.channel.send(`:mag: No tags **${ntn}** found`);
					} else {
						embedAuthor = `${message.member.user.tag}'s tags`;
						sendEmbed();
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
					console.info('[SEARCH TAG] Pushing tags');
					await serverRows.forEach(tag => {
						const ntn = txtFormatter(tag.tag);
						tagArray.push(ntn);
					});
					if(tagArray.length === 0) {
						console.info(`[SEARCH TAG] No tags found: ${ntn}`);
						return message.channel.send(`:mag: No tags **${ntn}** found`);
					} else {
						embedAuthor = `${message.guild.name}'s tags`;
						sendEmbed();
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
					console.info('[SEARCH TAG] Pushing tags');
					await tagRows.forEach(tag => {
						ntn = txtFormatter(tag.tag);
						let user = client.users.cache.get(tag.userID);
						if(tag.guildID !== null) {
							if(tag.guildID !== message.guild.id) return;
							tagArray.push(`${ntn} *(Server)*\nOwner: ${user.tag}\n`);
						} else {
							tagArray.push(`${ntn}\nOwner: ${user.tag}\n`);
						}
					});
					if(tagArray.length === 0) {
						console.info(`[SEARCH TAG] No tags found: ${ntn}`);
						return message.channel.send(`:mag: No tags **${ntn}** found`);
					} else {
						embedAuthor = `${ntn} details`;
						sendEmbed();
						return console.success(`[SEARCH TAG] Found tag ${ntn}, sent message`);
					}
				}
			} catch(error) {
				console.error(`[SEARCH TAG] ${error.stack}`);
				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			}
		}
	} };
