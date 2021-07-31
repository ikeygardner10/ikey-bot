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

		const member = await getMember(message, args);
		if(message.author.id === member.id) return message.lineReply('`Invalid (MENTION USER/USER ID - NOT YOURSELF)`');

		const cacheCheck = cache.has(member.id);
		if(cacheCheck === true) {
			return message.lineReply('`Invalid (MEMBER ALREADY HAS PENDING ADOPTION)`');
		}
		else {
			await cache.set(member.id, {});
		}

		const SQLpool = client.conPool.promise(); let eligible = true;

		const sqlFunc = async (stmt, vars, column, ID, guildID, errorMsg, returnResult) => {
			const [rows] = await SQLpool.query(stmt, vars);
			console.info(`[ADOPT CMD] Querying database for ${column}: ${ID} in guild: ${guildID}`);
			if(returnResult === false && rows[0]) {
				eligible = false;
				cache.del(member.id);
				console.info(`[ADOPT CMD] Entry found for ${column}: ${ID} in guild: ${guildID}, adoption cancelled`);
				return message.lineReply(`\`Invalid (${errorMsg})\``);
			}
			if(returnResult === true && rows[0]) {
				eligible = false;
				return rows[0];
			}
			return eligible = true;
		};

		let stmt = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `guildID`=?;';
		let vars = [message.author.id, message.author.id, message.guild.id]; let errorMsg = 'YOU\'RE NOT MARRIED';
		let familyID; let userID; let partnerID;
		await sqlFunc(stmt, vars, 'marraiges', message.author.id, message.guild.id, errorMsg, true)
			.then(result => {
				if(result.familyID !== undefined) {
					eligible = true;
					familyID = result.familyID;
					userID = result.userID;
					partnerID = result.partnerID;
				}
			});
		if(eligible === false) return cache.del(member.id);

		stmt = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
		vars = [member.id, message.guild.id]; errorMsg = 'MEMBER ALREADY ADOPTED';
		await sqlFunc(stmt, vars, 'adoptions', member.id, message.guild.id, errorMsg, false);
		if(eligible === false) return;

		stmt = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND (`userID`=? OR `partnerID`=?) AND `guildID`=?;';
		vars = [message.author.id, message.author.id, member.id, member.id, message.guild.id]; errorMsg = 'YOU\'RE MARRIED TO THEM';
		await sqlFunc(stmt, vars, 'marriages', `${message.author.id} & ${member.id}`, message.guild.id, errorMsg, false);
		if(eligible === false) return;

		stmt = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
		vars = [message.author.id, message.guild.id]; errorMsg = '';
		await sqlFunc(stmt, vars, 'adoptions', message.author.id, message.guild.id, errorMsg, true)
			.then(result => {
				if(eligible === true) return;
				stmt = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `familyID`=? AND `guildID`=?;';
				vars = [member.id, member.id, result.familyID, message.guild.id]; errorMsg = 'THEY\'RE YOUR PARENT';
				return sqlFunc(stmt, vars, 'marriages', result.familyID, message.guild.id, errorMsg, false);
			});
		if(eligible === false) return;

		stmt = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `guildID`=?;';
		vars = [member.id, member.id, message.guild.id]; errorMsg = '';
		await sqlFunc(stmt, vars, 'marriages', member.id, message.guild.id, errorMsg, true)
			.then(result => {
				if(eligible === true) return;
				let partner = result.userID;
				if(partner !== member.id) partner = result.partnerID;
				stmt = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `familyID`=? AND `guildID`=?;';
				vars = [partner, familyID, message.guild.id]; errorMsg = 'REALTED THROUGH MARRIAGE';
				return sqlFunc(stmt, vars, 'adoptions', partner, message.guild.id, errorMsg, false);
			});
		if(eligible === false) return;

		const createdAt = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
		const responseFilter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) ||
			no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) ||
			cancel.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === message.author.id);
		};

		stmt = 'INSERT INTO `adoptions` (`childID`, `parentID`, `familyID`, `guildID`, `createdAt`) VALUES (?, ?, ?, ?, ?);';
		vars = [member.id, message.author.id, familyID, message.guild.id, createdAt];
		console.info(`[ADOPT CMD] Found marriage for user: ${message.author.id} in guild: ${message.guild.id}, sending adoption`);
		console.warn(`${stmt} \n ${vars}`);
		message.channel.send(`${member}, ${message.author} wants to adopt you! :baby:\n\n**What do you say?**`).then((msg) => {
			message.channel.awaitMessages(responseFilter, { max: 1, time: 15000, errors: ['time'] })
				.then(collected => {
					if(yes.includes(collected.first().content.toLowerCase())) {
						return SQLpool.execute(stmt, vars)
							.then(() => {
								console.success(`[ADOPT CMD] ${member.id} accepted the adoption for familyID: ${familyID}`);
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