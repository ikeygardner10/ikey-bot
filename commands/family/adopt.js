/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const { Collection } = require('discord.js');
const { yes, no, cancel } = require('../../data/arrayData.json');
const MapCache = require('map-cache');
const cache = new MapCache();
const getMember = require('../../functions/getMember');

module.exports = {
	config: {
		name: 'adopt',
		aliases: ['a'],
		usage: '<@user>',
		cooldown: 10,
		category: 'family',
		permissions: '',
		args: true,
		description: 'Adopt a user into your family',
	},
	execute: async (client, message, args) => {

		const SQLpool = client.conPool.promise();
		let [rows] = []; let [stmt, vars] = ['', ''];
		let [familyIdOne, familyIdTwo, userID, partnerID] = ['', '', '', ''];

		const member = await getMember(message, args);
		if(message.author.id === member.id) return message.lineReply('`Invalid (MENTION USER/USER ID - NOT YOURSELF)`');

		const cacheCheck = cache.has(member.id);
		if(cacheCheck === true) {
			return message.lineReply('`Invalid (MEMBER ALREADY PENDING ADOPTION)`');
		}
		else {
			await cache.set(member.id, {});
		}

		stmt = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `guildID`=?;';
		vars = [message.author.id, message.author.id, message.guild.id];
		[rows] = await SQLpool.query(stmt, vars);
		console.info(`[ADOPT CMD] Querying database for marriage: ${message.author.id} in guild: ${message.guild.id}`);
		if(rows.length < 1) {
			console.info(`[ADOPT CMD] No entry found for marriage: ${message.author.id} in guild: ${message.guild.id}, adoption cancelled`);
			return message.lineReply('`Invalid (YOU\'RE NOT MARRIED)`').then(() => cache.del(member.id));
		}
		[familyIdOne, userID, partnerID] = [rows[0].familyID, rows[0].userID, rows[0].partnerID];

		stmt = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
		vars = [member.id, message.guild.id];
		[rows] = await SQLpool.query(stmt, vars);
		console.info(`[ADOPT CMD] Querying database for adoption: ${member.id} in guild: ${message.guild.id}`);
		if(rows.length > 0) {
			console.info(`[ADOPT CMD] Entry found for adoption: ${member.id} in guild: ${message.guild.id}, adoption cancelled`);
			return message.lineReply('`Invalid (MEMBER ALREADY ADOPTED)`').then(() => cache.del(member.id));
		}

		stmt = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND (`userID`=? OR `partnerID`=?) AND `guildID`=?;';
		vars = [message.author.id, message.author.id, member.id, member.id, message.guild.id];
		[rows] = await SQLpool.query(stmt, vars);
		console.info(`[ADOPT CMD] Querying database for marriage: ${message.author.id} & ${member.id} in guild: ${message.guild.id}`);
		if(rows.length > 0) {
			console.info(`[ADOPT CMD] Entry found for marriage: ${message.author.id} & ${member.id} in guild: ${message.guild.id}, adoption cancelled`);
			return message.lineReply('`Invalid (YOU\'RE MARRIED TO THEM)`').then(() => cache.del(member.id));
		}

		stmt = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
		vars = [message.author.id, message.guild.id];
		[rows] = await SQLpool.query(stmt, vars);
		console.info(`[ADOPT CMD] Querying database for adoption: ${message.author.id} in guild: ${message.guild.id}`);
		if(rows.length > 0) {
			familyIdTwo = rows[0].familyID;
			stmt = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `familyID`=? AND `guildID`=?;';
			vars = [member.id, member.id, familyIdTwo, message.guild.id];
			[rows] = await SQLpool.query(stmt, vars);
			console.info(`[ADOPT CMD] Querying database for marriage: ${member.id} & ${familyIdTwo} in guild: ${message.guild.id}`);
			if(rows.length > 0) {
				console.info(`[ADOPT CMD] Entry found for marriage: ${member.id} & ${familyIdTwo} in guild: ${message.guild.id}, adoption cancelled`);
				return message.lineReply('`Invalid (THEY\'RE YOUR PARENT)`').then(() => cache.del(member.id));
			}
		}

		stmt = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `guildID`=?;';
		vars = [member.id, member.id, message.guild.id];
		[rows] = await SQLpool.query(stmt, vars);
		console.info(`[ADOPT CMD] Querying database for marriage: ${member.id} in guild: ${message.guild.id}`);
		if(rows.length > 0) {
			let partner = rows[0].userID === member.id ? rows[0].userID : rows[0].partnerID;
			stmt = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `familyID`=? AND `guildID`=?;';
			vars = [partner, familyIdOne, message.guild.id];
			[rows] = await SQLpool.query(stmt, vars);
			console.info(`[ADOPT CMD] Querying database for adoption: ${partner} & ${familyIdOne} in guild: ${message.guild.id}`);
			if(rows.length > 0) {
				console.info(`[ADOPT CMD] Entry found for marriage: ${partner} & ${familyIdOne} in guild: ${message.guild.id}, adoption cancelled`);
				return message.lineReply('`Invalid (REALTED THROUGH MARRIAGE)`').then(() => cache.del(member.id));
			}
			if(familyIdTwo.length > 0) {
				stmt = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `familyID`=? AND `guildID`=?;';
				vars = [partner, familyIdTwo, message.guild.id];
				[rows] = await SQLpool.query(stmt, vars);
				console.info(`[ADOPT CMD] Querying database for adoption: ${partner} & ${familyIdTwo} in guild: ${message.guild.id}`);
				if(rows.length > 0) {
					console.info(`[ADOPT CMD] Entry found for marriage: ${partner} & ${familyIdTwo} in guild: ${message.guild.id}, adoption cancelled`);
					return message.lineReply('`Invalid (REALTED THROUGH MARRIAGE)`').then(() => cache.del(member.id));
				}
			}
		}

		const createdAt = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
		const responseFilter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) ||
			no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) ||
			cancel.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === message.author.id);
		};

		stmt = 'INSERT INTO `adoptions` (`childID`, `parentID`, `familyID`, `guildID`, `createdAt`) VALUES (?, ?, ?, ?, ?);';
		vars = [member.id, message.author.id, familyIdOne, message.guild.id, createdAt];
		console.info(`[ADOPT CMD] Found marriage for user: ${message.author.id} in guild: ${message.guild.id}, sending adoption`);
		message.channel.send(`${member}, ${message.author} wants to adopt you! :baby:\n\n**What do you say?**`).then((msg) => {
			message.channel.awaitMessages(responseFilter, { max: 1, time: 15000, errors: ['time'] })
				.then(collected => {
					if(yes.includes(collected.first().content.toLowerCase())) {
						return SQLpool.execute(stmt, vars)
							.then(() => {
								console.success(`[ADOPT CMD] ${member.id} accepted the adoption for familyID: ${familyIdOne}`);
								msg.lineReply(`Congratulations to ${member}!\n**<@${userID}> & <@${partnerID}> welcome you to the family 👪**`);
								return cache.del(member.id);
							})
							.catch((error) => {
								console.error(`[ADOPT CMD] ${error.stack}`);
								msg.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
								return cache.del(member.id);
							});
					}
					else if(no.includes(collected.first().content.toLowerCase())) {
						console.info(`[ADOPT CMD] ${member.id} declined the adoption`);
						msg.lineReply(`${member} declined the adoption! :broken_heart:`);
						return cache.del(member.id);
					}
					else if(cancel.includes(collected.first().content.toLowerCase())) {
						console.info(`[ADOPT CMD] ${message.author.id} cancelled the adoption`);
						msg.lineReply(`${message.author} cancelled the adoption! :broken_heart:`);
						return cache.del(member.id);
					}
				}).catch((timeout) => {
					console.info(`[ADOPT CMD] Timed out for user: ${message.author.id} in guild: ${message.guild.id}`);
					msg.lineReply(`${message.author}, no response! :sob:`);
					return cache.del(member.id);
				});
		});

	} };