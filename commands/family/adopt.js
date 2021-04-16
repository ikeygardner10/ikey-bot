/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const YesNo = require('../../data/YesNo.json');

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

		const author = message.author; const member = message.mentions.members.first(); const guild = message.guild;
		if(!member) return message.channel.send('`Invalid Adoption (NO USER MENTIONED)`'); if(author.id === member.id) return message.channel.send('`Invalid Adoption (NO SELF ADOPTING)`');

		let checkMarriages = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `guildID`=?;';
		const checkAdoptions = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
		let checkParents = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
		const addAdoption = 'INSERT INTO `adoptions` (`childID`, `parentID`, `familyID`, `guildID`, `createdAt`) VALUES (?, ?, ?, ?, ?);';

		const SQLpool = client.conPool.promise(); let eligible = true;

		// member married to users adopted child, member is users parent, users not married, users married to them,

		const sqlFunc = async (stmt, vars, column, ID, guildID, errorMsg, returnResult) => {
			const [rows] = await SQLpool.query(stmt, vars);
			console.info(`[ADOPT CMD] Querying database for ${column}: ${ID} in guild: ${guildID}`);
			if(rows[0]) {
				eligible = false;
				if(returnResult === true) return rows[0];
				console.info(`[ADOPT CMD] Entry found for ${column}: ${ID} in guild: ${guildID}, adoption cancelled`);
				return message.channel.send(`\`Invalid Adoption (${errorMsg})\``);
			}
			return eligible = true;
		};

		let stmt = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `guildID`=?;';
		let vars = [author.id, author.id, guild.id]; let errorMsg = 'YOU\'RE NOT MARRIED';
		let familyID; let userID; let partnerID;
		await sqlFunc(stmt, vars, 'userID/partnerID', author.id, guild.id, errorMsg, true)
			.then(result => {
				if(result.familyID) {
					eligible = true;
					familyID = result.familyID;
					userID = result.userID;
					partnerID = result.partnerID;
				}
			});
		if(eligible === false) return;

		stmt = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
		vars = [member.id, guild.id]; errorMsg = 'MEMBER ALREADY ADOPTED';
		await sqlFunc(stmt, vars, 'childID', member.id, guild.id, errorMsg, false);
		if(eligible === false) return;

		stmt = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND (`userID`=? OR `partnerID`=?) AND `guildID`=?;';
		vars = [author.id, author.id, member.id, member.id, guild.id]; errorMsg = 'YOU\'RE MARRIED TO THEM';
		await sqlFunc(stmt, vars, 'userID & partnerID', `${author.id} & ${member.id}`, guild.id, errorMsg, false);
		if(eligible === false) return;

		stmt = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
		vars = [author.id, guild.id]; errorMsg = '';
		await sqlFunc(stmt, vars, 'childID', author.id, guild.id, errorMsg, true)
			.then(result => {
				if(eligible === true) return;
				stmt = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `familyID`=? AND `guildID`=?;';
				vars = [member.id, member.id, result.familyID, guild.id]; errorMsg = 'THEY\'RE YOUR PARENT';
				return sqlFunc(stmt, vars, 'matching familyID', result.familyID, guild.id, errorMsg, false);
			});
		if(eligible === false) return;

		const yes = YesNo.yes; const no = YesNo.no; const createdAt = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
		const responseFilter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id && response.author.id !== client.user.id) || no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id && response.author.id !== client.user.id);
		};

		console.info(`[ADOPT CMD] Found marriage for user: ${author.id} in guild: ${guild.id}, sending adoption`);
		message.channel.send(`${member}, ${author} wants to adopt you! :baby:\n\n**What do you say?**`).then(() => {
			message.channel.awaitMessages(responseFilter, { max: 1, time: 15000, errors: ['time'] })
				.then(collected => {
					if(yes.includes(collected.first().content.toLowerCase())) {
						return SQLpool.execute(addAdoption, [member.id, author.id, familyID, guild.id, createdAt])
							.then(() => {
								console.success(`[ADOPT CMD] ${member.id} accepted the adoption for familyID: ${familyID}`);
								return message.channel.send(`Congratulations to ${member}!\n**<@${userID}> & <@${partnerID}> welcome you to the family 👪**`);
							})
							.catch((error) => {
								console.error(`[ADOPT CMD] ${error.stack}`);
								return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
							});
					} else if(no.includes(collected.first().content.toLowerCase())) {
						console.info(`[ADOPT CMD] ${member.id} declined the adoption`);
						return message.channel.send(`${member} declined the adoption! :broken_heart:`);
					}
				}).catch((timeout) => {
					console.info(`[ADOPT CMD] Timed out for user: ${author.id} in guild: ${guild.id}`);
					return message.channel.send(`${author}, no response! :sob:`);
				});
		});
	} };