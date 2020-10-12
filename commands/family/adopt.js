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

		const checkMarriages = 'SELECT * FROM `marriages` WHERE (`partnerOneID`=? OR `partnerTwoID`=?) AND `guildID`=?;';
		const checkAdoptions = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
		let checkParents = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
		const addAdoption = 'INSERT INTO `adoptions` (`childID`, `familyID`, `guildID`, `createdAt`) VALUES (?, ?, ?, ?);';

		const SQLpool = client.conPool.promise();

		const [isChildRows] = await SQLpool.query(checkParents, [author.id, guild.id]);
		console.info(`[ADOPT CMD] Querying database for adoption: ${author.id} in guild: ${guild.id}`);
		if(isChildRows[0] !== undefined) {
			const authorFamilyID = isChildRows[0].familyID;
			checkParents = 'SELECT * FROM `marriages` WHERE `familyID`=? AND `guildID`=?;';
			const [authorParentsRows] = await SQLpool.query(checkParents, [authorFamilyID, guild.id]);
			console.info(`[ADOPT CMD] Querying database for matching familyID: ${authorFamilyID} in guild: ${guild.id}`);
			if(authorParentsRows[0] !== undefined) {
				if(authorParentsRows[0].partnerOneID === member.id || authorParentsRows[0].partnerTwoID === member.id) {
					console.info(`[ADOPT CMD] Entry found with matching familyID: ${authorFamilyID} in guild: ${guild.id}, cancelling adoption`);
					return message.channel.send('`Invalid Adoption (THEY\'RE YOUR PARENT)`');
				}
			}
		}

		const [authorRows] = await SQLpool.query(checkMarriages, [author.id, author.id, guild.id]);
		console.info(`[ADOPT CMD] Querying database for marriage: ${author.id} in guild: ${guild.id}`);
		if(authorRows[0] === undefined) {
			console.info(`[ADOPT CMD] No entry found for marriage: ${author.id} in guild: ${guild.id}, cancelling adoption`);
			return message.channel.send('`Invalid Adoption (YOU\'RE NOT MARRIED)`');
		}

		const [childRows] = await SQLpool.query(checkAdoptions, [member.id, guild.id]);
		console.info(`[ADOPT CMD] Querying database for existing adoption: ${member.id} in guild: ${guild.id}`);
		if(childRows[0] !== undefined) {
			console.info(`[ADOPT CMD] Existing entry found for child: ${member.id} in guild: ${guild.id}, cancelling adoption`);
			return message.channel.send('`Invalid Adoption (USER ALREADY ADOPTED)`');
		}

		const familyID = authorRows[0].familyID; const yes = YesNo.yes; const no = YesNo.no; const createdAt = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
		const responseFilter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) || no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id);
		};

		console.info(`[ADOPT CMD] Found marriage for user: ${author.id} in guild: ${guild.id}, sending adoption`);
		message.channel.send(`${member}, ${author} wants to adopt you! :baby:\n\n**What do you say?**`).then(() => {
			message.channel.awaitMessages(responseFilter, { max: 1, time: 15000, errors: ['time'] })
				.then(collected => {
					if(yes.includes(collected.first().content.toLowerCase())) {
						return SQLpool.query(addAdoption, [member.id, familyID, guild.id, createdAt])
							.then(() => {
								console.success(`[ADOPT CMD] ${member.id} accepted the adoption for familyID: ${familyID}`);
								return message.channel.send(`Congratulations to ${member}!\n**<@${authorRows[0].partnerOneID}> & <@${authorRows[0].partnerTwoID}> welcome you to the family 👪**`);
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
					console.info(`[ADOPT CMD] ${timeout.values()}`);
					return message.channel.send(`${author}, no response! :sob:`);
				});
		});
	} };