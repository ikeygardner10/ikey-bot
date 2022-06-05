/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const { Collection } = require('discord.js');
const shortid = require('shortid');
const { yes, no, cancel } = require('../../data/arrayData.json');
const MapCache = require('map-cache');
const cache = new MapCache();
const getMember = require('../../functions/getMember');

module.exports = {
	config: {
		name: 'marry',
		aliases: ['my'],
		usage: '<@user>',
		cooldown: 10,
		category: 'family',
		permissions: '',
		args: false,
		description: 'Ask a person for their hand in marriage',
	},
	execute: async (client, message, args) => {

		const SQLpool = client.conPool.promise();
		let [rows] = []; let familyID;

		const member = await getMember(message, args);
		if(message.author.id === member.id) return message.lineReply('`Invalid (MENTION USER/USER ID - NOT YOURSELF)`');

		const cacheCheck = cache.has(member.id);
		if(cacheCheck === true) {
			return message.lineReply('`Invalid (MEMBER ALREADY PENDING MARRIAGE)`');
		}
		else {
			await cache.set(member.id, {});
		}

		[rows] = await SQLpool.query('SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `guildID`=?;', [message.author.id, message.author.id, message.guild.id]);
		console.info(`[MARRY CMD] Querying database for marriage: ${message.author.id} in guild: ${message.guild.id}`);
		if(rows.length > 0) {
			console.info(`[MARRY CMD] Entry found for marriage: ${message.author.id} in guild: ${message.guild.id}, proposal cancelled`);
			return message.lineReply('`Invalid (YOU\'RE ALREADY MARRIED)`').then(() => cache.del(member.id));
		}

		[rows] = await SQLpool.query('SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `guildID`=?;', [member.id, member.id, message.guild.id]);
		console.info(`[MARRY CMD] Querying database for marriage: ${member.id} in guild: ${message.guild.id}`);
		if(rows.length > 0) {
			console.info(`[MARRY CMD] Entry found for marriage: ${member.id} in guild: ${message.guild.id}, proposal cancelled`);
			return message.lineReply('`Invalid (THEY\'RE ALREADY MARRIED)`').then(() => cache.del(member.id));
		}

		[rows] = await SQLpool.query('SELECT * FROM `adoptions` WHERE `childID`=? AND `guildID`=?;', [message.author.id, message.guild.id]);
		console.info(`[MARRY CMD] Querying database for adoption: ${message.author.id} in guild: ${message.guild.id}`);
		if(rows.length > 0) {
			familyID = rows[0].familyID;
			console.info(`[MARRY CMD] Entry found for adoption: ${message.author.id} in guild: ${message.guild.id}`);
			[rows] = await SQLpool.query('SELECT * FROM `adoptions` WHERE `childID`=? AND `familyID`=? AND `guildID`=?;', [member.id, familyID, message.guild.id]);
			console.info(`[MARRY CMD] Querying database for adoption: ${member.id} & ${familyID} in guild: ${message.guild.id}`);
			if(rows.length > 0) {
				console.info(`[MARRY CMD] Entry found for adoption: ${member.id} & ${familyID} in guild: ${message.guild.id}, proposal cancelled`);
				return message.lineReply('`Invalid (THEY\'RE YOUR SIBLING)`').then(() => cache.del(member.id));
			}
		}

		const filter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) ||
			no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) ||
			cancel.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === message.author.id);
		};
		shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
		familyID = shortid.generate();
		const createdAt = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

		console.info(`[MARRY CMD] Checks succeeded for users: ${message.author.id} & ${member.id} in guild: ${message.guild.id}, sending proposal`);
		message.channel.send(`${member}, ${message.author} is proposing! :ring:\n\n**What do you say?**`).then((msg) => {
			message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
				.then(collected => {
					if(yes.includes(collected.first().content.toLowerCase())) {
						return SQLpool.execute('INSERT INTO `marriages` (`userID`, `partnerID`, `familyID`, `guildID`, `createdAt`) VALUES (?, ?, ?, ?, ?);', [message.author.id, member.id, familyID, message.guild.id, createdAt])
							.then(() => {
								console.success(`[MARRY CMD] Marraige added for users: ${message.author.id} & ${member.id}`);
								return msg.lineReply(`The wedding is to be held immediately.\n\n**Congratulations ${message.author} & ${member}! 🤵 👰**\n\nYou may now kiss :flushed:`).then(() => cache.del(member.id));
							})
							.catch((error) => {
								console.error(`[MARRY CMD] ${error.stack}`);
								return msg.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``).then(() => cache.del(member.id));
							});
					}
					else if(no.includes(collected.first().content.toLowerCase())) {
						console.info(`[MARRY CMD] ${member.id} declined the proposal`);
						return msg.lineReply(`${message.author}, ${member} declined the proposal! :sob:`).then(() => cache.del(member.id));
					}
					else if(cancel.includes(collected.first().content.toLowerCase())) {
						console.info(`[MARRY CMD] ${message.message.author.id} cancelled the marraige`);
						return msg.lineReply(`${message.message.author} cancelled the marraige! :sob:`).then(() => cache.del(member.id));
					}
				}).catch((timeout) => {
					console.info(`[MARRY CMD] Timed out for user: ${message.author.id} in guild: ${message.guild.id}`);
					return msg.lineReply(`${message.author}, no response! :sob:`).then(() => cache.del(member.id));
				});
		});

	} };