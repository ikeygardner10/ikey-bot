/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const { Collection } = require('discord.js');
const shortid = require('shortid');
const { yes, no, cancel } = require('../../data/arrayData.json');
const MapCache = require('map-cache');
const cache = new MapCache();

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

		// check for existing marriage, existing partner marriage, existing adoption, exsting sibling,

		const author = message.author; const member = message.mentions.members.first(); const guild = message.guild;
		if(!member) return message.channel.send('`Invalid Proposal (NO USER MENTIONED)`'); if(author.id === member.id) return message.channel.send('`Invalid Proposal (NO SOLOGAMY)`');

		const cacheCheck = cache.has(member.id);
		if(cacheCheck === true) {
			return message.channel.send('`Invalid Marraige (MEMBER ALREADY HAS PENDING MARRIAGE)`');
		} else {
			await cache.set(member.id, {});
		}

		const SQLpool = client.conPool.promise(); let eligible = true;

		const sqlFunc = async (stmt, vars, column, ID, guildID, errorMsg, returnResult) => {
			const [rows] = await SQLpool.query(stmt, vars);
			console.info(`[MARRY CMD] Querying database for ${column}: ${ID} in guild: ${guildID}`);
			if(returnResult === false && rows[0]) {
				eligible = false;
				cache.del(member.id);
				console.info(`[MARRY CMD] Entry found for ${column}: ${ID} in guild: ${guildID}, proposal cancelled`);
				return message.channel.send(`\`Invalid Proposal (${errorMsg})\``);
			}
			if(returnResult === true && rows[0]) {
				eligible = false;
				return rows[0];
			}
			return eligible = true;
		};

		let stmt = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `guildID`=?;';
		let vars = [author.id, author.id, guild.id]; let errorMsg = 'YOU\'RE ALREADY MARRIED';
		await sqlFunc(stmt, vars, 'userID', author.id, guild.id, errorMsg, false);
		if(eligible === false) return cache.del(member.id);

		vars = [member.id, member.id, guild.id]; errorMsg = 'MEMBER ALREADY MARRIED';
		await sqlFunc(stmt, vars, 'partnerID', member.id, guild.id, errorMsg, false);
		if(eligible === false) return cache.del(member.id);

		stmt = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
		vars = [author.id, guild.id]; errorMsg = '';
		await sqlFunc(stmt, vars, 'childID', author.id, guild.id, errorMsg, true)
			.then(result => {
				if(eligible === true) return;
				const familyID = result.familyID; const childID = result.childID;
				stmt = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `familyID`=? AND `guildID`=?;';
				vars = [member.id, familyID, guild.id]; errorMsg = 'RELATED THROUGH ADOPTION';
				return sqlFunc(stmt, vars, 'matching familyID', familyID, guild.id, errorMsg, false);
			});
		if(eligible === false) return cache.del(member.id);

		const filter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) ||
			no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) ||
			cancel.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === message.author.id);
		};
		shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
		const familyID = shortid.generate();
		const createdAt = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

		stmt = 'INSERT INTO `marriages` (`userID`, `partnerID`, `familyID`, `guildID`, `createdAt`) VALUES (?, ?, ?, ?, ?);';
		vars = [author.id, member.id, familyID, guild.id, createdAt];
		console.info(`[MARRY CMD] No existing entries, sending proposal for ${author.id} & ${member.id}`);
		console.warn(`${stmt} \n ${vars}`);
		message.channel.send(`${member}, ${author} is proposing! :ring:\n\n**What do you say?**`).then(() => {
			message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
				.then(collected => {
					if(yes.includes(collected.first().content.toLowerCase())) {
						return SQLpool.execute(stmt, vars)
							.then(() => {
								console.success(`[MARRY CMD] Marraige added for users: ${author.id} & ${member.id}`);
								message.channel.send(`The wedding is to be held immediately.\n\n**Congratulations ${author} & ${member}! 🤵 👰**\n\nYou may now kiss :flushed:`);
								return cache.del(member.id);
							})
							.catch((error) => {
								console.error(`[MARRY CMD] ${error.stack}`);
								message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
								return cache.del(member.id);
							});
					} else if(no.includes(collected.first().content.toLowerCase())) {
						console.info(`[MARRY CMD] ${member.id} declined the proposal`);
						message.channel.send(`${author}, ${member} declined the proposal! :sob:`);
						return cache.del(member.id);
					} else if(cancel.includes(collected.first().content.toLowerCase())) {
						console.info(`[MARRY CMD] ${message.author.id} cancelled the marraige`);
						message.channel.send(`${message.author} cancelled the marraige! :sob:`);
						return cache.del(member.id);
					}
				}).catch((timeout) => {
					console.info(`[MARRY CMD] Timed out for user: ${author.id} in guild: ${guild.id}`);
					message.channel.send(`${author}, no response! :sob:`);
					return cache.del(member.id);
				});
		});

	} };