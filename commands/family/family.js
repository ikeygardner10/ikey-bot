/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'family',
		aliases: ['f'],
		usage: '<@user (optional)>',
		cooldown: 10,
		category: 'family',
		permissions: '',
		args: false,
		description: 'View yours or anothers family details',
	},
	execute: async (client, message, args) => {

		const member = message.mentions.members.first() || message.member; const guild = message.guild;

		const checkMarriages = 'SELECT * FROM `marriages` WHERE (`partnerOneID`=? OR `partnerTwoID`=?) AND `guildID`=?;';
		const checkAdoptions = 'SELECT * FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';
		const checkIsChild = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
		const checkParents = 'SELECT * FROM `marriages` WHERE `familyID`=? AND `guildiD`=?;';
		const checkSiblings = 'SELECT * FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';

		const fEmbed = new MessageEmbed()
			.setAuthor(`${member.user.tag}'s Family`, member.user.avatarURL())
			.setColor(0xFFFFFA)
			.setTimestamp();

		const SQLpool = client.conPool.promise();

		let desc = '';

		try {
			const [isMarriedRows] = await SQLpool.query(checkMarriages, [member.id, member.id, guild.id]);
			console.info(`[FAMILY CMD] Querying database for partner: ${member.id} in guild: ${guild.id}`);
			if(isMarriedRows[0] !== undefined) {

				const marriedFamilyID = isMarriedRows[0].familyID;
				const marriedDate = isMarriedRows[0].createdAt.toString();
				const formattedMarriedDate = marriedDate.slice(0, marriedDate.lastIndexOf(':'));
				let partner = isMarriedRows[0].partnerOneID;
				if(member.id === partner) partner = isMarriedRows[0].partnerTwoID;
				desc += `**:couple: Partner:** <@${partner}>\n**:calendar: Married:** ${formattedMarriedDate}\n\n`;

				const [hasChildRows] = await SQLpool.query(checkAdoptions, [marriedFamilyID, guild.id]);
				console.info(`[FAMILY CMD] Querying database for children: ${marriedFamilyID} in guild: ${guild.id}`);
				if(hasChildRows[0] !== undefined) {
					await hasChildRows.forEach(row => {
						const adoptionDate = row.createdAt.toString();
						const formattedAdoptionDate = adoptionDate.slice(0, adoptionDate.lastIndexOf(':'));
						desc += `**:child: Child:** <@${row.childID}>\n**:calendar: Date Adopted:** ${formattedAdoptionDate}\n`;
					});
				}
			}

			const [isChildRows] = await SQLpool.query(checkIsChild, [member.id, guild.id]);
			console.info(`[FAMILY CMD] Querying database for parents: ${member.id} in guild: ${guild.id}`);
			if(isChildRows[0] !== undefined) {

				const adoptedFamilyID = isChildRows[0].familyID;
				const adoptedDate = isChildRows[0].createdAt.toString();
				const formattedAdoptedDate = adoptedDate.slice(0, adoptedDate.lastIndexOf(':'));

				const [hasParentRows] = await SQLpool.query(checkParents, [adoptedFamilyID, guild.id]);
				console.info(`[FAMILY CMD] Querying database for parents: ${adoptedFamilyID} in guild: ${guild.id}`);
				const parentOne = hasParentRows[0].partnerOneID; const parentTwo = hasParentRows[0].partnerTwoID;
				desc += `\n\n**:people_holding_hands: Parents:** <@${parentOne}> & <@${parentTwo}>\n**:calendar: Adopted:** ${formattedAdoptedDate}\n`;

				const [hasSiblingsRows] = await SQLpool.query(checkSiblings, [adoptedFamilyID, guild.id]);
				console.info(`[FAMILY CMD] Querying database for siblings: ${adoptedFamilyID} in guild: ${guild.id}`);
				if(hasSiblingsRows[0] !== undefined) {
					await hasSiblingsRows.forEach(row => {
						if(row.childID === message.author.id) return;
						desc += `\n**:child: Sibling:** <@${row.childID}>`;
					});
				}
			}

			if(desc.length === 0) return message.channel.send('`Invalid (NO FAMILY)`');
			fEmbed.setDescription(desc);
			return message.channel.send(fEmbed);

		} catch(error) {
			console.error(`[FAMILY CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}


		// console.info(`[FAMILY CMD] No entry found for user: ${member.id} in guild: ${guild.id}`);
		// return message.channel.send('`Invalid (USER NOT MARRIED)`');
	} };