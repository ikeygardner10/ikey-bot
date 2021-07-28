/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const { MessageEmbed } = require('discord.js');
const { close } = require('fs');
const wait = require('util').promisify(setTimeout);
const paginationEmbed = require('discord.js-pagination');

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

		let member = message.mentions.members.first() || message.member;
		const guild = message.guild;
		const SQLpool = client.conPool.promise();

		let [descOne, descTwo, descThree] = ['', '', ''];
		let [married, adopted] = [false, false];
		let partnerID;
		let nuclearFamilyID;
		let closeFamilyID;
		let parentOneFamilyID;
		let parentTwoFamilyID;
		let inLawFamilyID;
		let displayNameOne;
		let displayNameTwo;
		let parentOneID;
		let parentTwoID;

		const dateCleaner = async (yuckDate) => {
			const cleanDate = await yuckDate.match(/(\s[a-zA-Z0-9]*){3}/);
			return cleanDate[0];
		};

		const grabMember = async (id) => {
			let name;
			try {
				name = await guild.members.fetch(id);
				name = name.displayName;
			} catch {
				name = `<@${id}>`;
			}
			return name;
		};

		// Check for marriage, define partner, format date, grab member, append descOne
		let stmt = 'SELECT `userID`, `partnerID`, `familyID`, `createdAt` FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `guildID`=?;';
		const [marriedRow] = await SQLpool.query(stmt, [member.id, member.id, guild.id]);
		console.info(`[FAMILY CMD] Querying database for marriages: ${member.id} in guild: ${guild.id}`);
		if(marriedRow[0]) {
			married = true;
			nuclearFamilyID = marriedRow[0].familyID;
			partnerID = marriedRow[0].userID;
			if(member.id === partnerID) partnerID = marriedRow[0].partnerID;
			formattedDate = await dateCleaner(marriedRow[0].createdAt.toString());
			displayNameOne = await grabMember(partnerID);
			descOne += `**:couple: Partner:** ${displayNameOne}\n**:calendar: Married:** ${formattedDate}\n`;

			// Check for adoptions, format date, grab member, append descOne
			stmt = 'SELECT `childID`, `createdAt` FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';
			const [childrenRows] = await SQLpool.query(stmt, [nuclearFamilyID, guild.id]);
			console.info(`[FAMILY CMD] Querying database for adoptions: ${nuclearFamilyID} in guild: ${guild.id}`);
			if(childrenRows[0]) {
				await childrenRows.forEach(async row => {
					formattedDate = await dateCleaner(row.createdAt.toString());
					displayNameOne = await grabMember(row.childID);
					descOne += `\n**:child: Child:** ${displayNameOne}\n**:calendar: Adopted:** ${formattedDate}`;
				});
			} else {
				console.info(`[FAMILY CMD] No entry found for adoptions: ${nuclearFamilyID} in guild: ${guild.id}`);
			}
		} else {
			console.info(`[FAMILY CMD] No entry found for marriages: ${member.id} in guild: ${guild.id}`);
		}

		stmt = 'SELECT `familyID` FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
		const [adoptedRow] = await SQLpool.query(stmt, [member.id, guild.id]);
		console.info(`[FAMILY CMD] Querying database for adoptions: ${member.id} in guild: ${guild.id}`);
		if(adoptedRow[0]) {
			closeFamilyID = adoptedRow[0].familyID;
			stmt = 'SELECT `userID`, `partnerID` FROM `marriages` WHERE `familyID`=? AND `guildID`=?;';
			const [parentsRow] = await SQLpool.query(stmt, [closeFamilyID, guild.id]);
			console.info(`[FAMILY CMD] Querying database for marriages: ${closeFamilyID} in guild: ${guild.id}`);
			if(parentsRow[0]) {
				adopted = true;
				parentOneID = parentsRow[0].userID;
				parentTwoID = parentsRow[0].partnerID;
				displayNameOne = await grabMember(parentOneID);
				displayNameTwo = await grabMember(parentTwoID);
				descOne += `\n\n**:people_holding_hands: Parents:** ${displayNameOne} & ${displayNameTwo}\n`;

				stmt = 'SELECT `childID` FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';
				const [siblingRows] = await SQLpool.query(stmt, [closeFamilyID, guild.id]);
				console.info(`[FAMILY CMD] Querying database for adoptions: ${closeFamilyID} in guild: ${guild.id}`);
				if(siblingRows[0]) {
					await siblingRows.forEach(async row => {
						if(member.id === row.childID) return;
						displayNameOne = await grabMember(row.childID);
						descOne += `\n**:child: Sibling:** ${displayNameOne}`;
					});
				} else {
					console.info(`[FAMILY CMD] No entry found for adoptions: ${closeFamilyID} in guild: ${guild.id}`);
				}
			} else {
				console.info(`[FAMILY CMD] No entry found for marriages: ${closeFamilyID} in guild: ${guild.id}`);
			}
		} else {
			console.info(`[FAMILY CMD] No entry found for adoptions: ${member.id} in guild: ${guild.id}`);
		}

		if(adopted === true) {
			stmt = 'SELECT `familyID` FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
			const [parentOneAdoptionRow] = await SQLpool.query(stmt, [parentOneID, guild.id]);
			console.info(`[FAMILY CMD] Querying database for adoptions: ${parentOneID} in guild: ${guild.id}`);
			if(parentOneAdoptionRow[0]) {
				parentOneFamilyID = parentOneAdoptionRow[0].familyID;
				stmt = 'SELECT `userID`, `partnerID` FROM `marriages` WHERE `familyID`=? AND `guildID`=?;';
				const [grandParentsOneRow] = await SQLpool.query(stmt, [parentOneFamilyID, guild.id]);
				console.info(`[FAMILY CMD] Querying database for marriages: ${parentOneFamilyID} in guild: ${guild.id}`);
				if(grandParentsOneRow[0]) {
					displayNameOne = await grabMember(grandParentsOneRow[0].userID);
					displayNameTwo = await grabMember(grandParentsOneRow[0].partnerID);
					descTwo += `**:older_adult: Grandparents:** ${displayNameOne} & ${displayNameTwo}\n`;

					stmt = 'SELECT `childID` FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';
					const [extendFamilyOneRows] = await SQLpool.query(stmt, [parentOneFamilyID, guild.id]);
					console.info(`[FAMILY CMD] Querying database for adoptions: ${parentOneFamilyID} in guild: ${guild.id}`);
					if(extendFamilyOneRows[0]) {
						await extendFamilyOneRows.forEach(async row => {
							if(parentOneID === row.childID || parentTwoID === row.childID) return;
							displayNameOne = await grabMember(row.childID);
							descTwo += `\n**:adult: Aunt/Uncle:** ${displayNameOne}`;
						});

					} else {
						console.info(`[FAMILY CMD] No entry found for adoptions: ${parentOneFamilyID} in guild: ${guild.id}`);
					}
				} else {
					console.info(`[FAMILY CMD] No entry found for marriages: ${parentOneFamilyID} in guild: ${guild.id}`);
				}
			} else {
				console.info(`[FAMILY CMD] No entry found for adoptions: ${parentOneID} in guild: ${guild.id}`);
			}

			stmt = 'SELECT `familyID` FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
			const [parentTwoAdoptionRow] = await SQLpool.query(stmt, [parentTwoID, guild.id]);
			console.info(`[FAMILY CMD] Querying database for adoptions: ${parentTwoID} in guild: ${guild.id}`);
			if(parentTwoAdoptionRow[0]) {
				parentTwoFamilyID = parentTwoAdoptionRow[0].familyID;
				stmt = 'SELECT `userID`, `partnerID` FROM `marriages` WHERE `familyID`=? AND `guildID`=?;';
				const [grandParentsTwoRow] = await SQLpool.query(stmt, [parentTwoFamilyID, guild.id]);
				console.info(`[FAMILY CMD] Querying database for marriages: ${parentTwoFamilyID} in guild: ${guild.id}`);
				if(grandParentsTwoRow[0]) {
					displayNameOne = await grabMember(grandParentsTwoRow[0].userID);
					displayNameTwo = await grabMember(grandParentsTwoRow[0].partnerID);
					descTwo += `\n\n**:older_adult: Grandparents:** ${displayNameOne} & ${displayNameTwo}\n`;

					stmt = 'SELECT `childID` FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';
					const [extendFamilyTwoRows] = await SQLpool.query(stmt, [parentTwoFamilyID, guild.id]);
					console.info(`[FAMILY CMD] Querying database for adoptions: ${parentTwoFamilyID} in guild: ${guild.id}`);
					if(extendFamilyTwoRows[0]) {
						await extendFamilyTwoRows.forEach(async row => {
							if(parentOneID === row.childID || parentTwoID === row.childID) return;
							displayNameOne = await grabMember(row.childID);
							descTwo += `\n**:adult: Aunt/Uncle:** ${displayNameOne}`;
						});

					} else {
						console.info(`[FAMILY CMD] No entry found for adoptions: ${parentTwoFamilyID} in guild: ${guild.id}`);
					}
				} else {
					console.info(`[FAMILY CMD] No entry found for marriages: ${parentTwoFamilyID} in guild: ${guild.id}`);
				}
			} else {
				console.info(`[FAMILY CMD] No entry found for adoptions: ${parentTwoID} in guild: ${guild.id}`);
			}
		}

		if(married === true) {
			stmt = 'SELECT `familyID` FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
			const [parterAdoptionRow] = await SQLpool.query(stmt, [partnerID, guild.id]);
			console.info(`[FAMILY CMD] Querying database for adoptions: ${partnerID} in guild: ${guild.id}`);
			if(parterAdoptionRow[0]) {
				inLawFamilyID = parterAdoptionRow[0].familyID;
				stmt = 'SELECT `userID`, `partnerID` FROM `marriages` WHERE `familyID`=? AND `guildID`=?;';
				const [partnerParentsRow] = await SQLpool.query(stmt, [inLawFamilyID, guild.id]);
				console.info(`[FAMILY CMD] Querying database for marriages: ${inLawFamilyID} in guild: ${guild.id}`);
				if(partnerParentsRow[0]) {
					displayNameOne = await grabMember(partnerParentsRow[0].userID);
					displayNameTwo = await grabMember(partnerParentsRow[0].partnerID);
					descThree += `**:people_holding_hands: Parents In-Law:** ${displayNameOne} & ${displayNameTwo}\n`;

					stmt = 'SELECT `childID` FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';
					const [partnerSiblingsRows] = await SQLpool.query(stmt, [inLawFamilyID, guild.id]);
					console.info(`[FAMILY CMD] Querying database for adoptions: ${inLawFamilyID} in guild: ${guild.id}`);
					if(partnerSiblingsRows[0]) {
						await partnerSiblingsRows.forEach(async row => {
							if(row.childID === partnerID) return;
							displayNameOne = await grabMember(row.childID);
							descThree += `\n**:adult: Sibling In-Law:** ${displayNameOne}`;
						});
					} else {
						console.info(`[FAMILY CMD] No entry found for adoptions: ${inLawFamilyID} in guild: ${guild.id}`);
					}
				} else {
					console.info(`[FAMILY CMD] No entry found for marriages: ${inLawFamilyID} in guild: ${guild.id}`);
				}
			} else {
				console.info(`[FAMILY CMD] No entry found for adoptions: ${partnerID} in guild: ${guild.id}`);
			}
		}

		if(descOne.length === 0) return message.channel.send('`Invalid (NO FAMILY)`');

		const pageOne = new MessageEmbed()
			.setAuthor(`${member.user.tag}'s Close Family`, member.user.avatarURL())
			.setColor(0xFFFFFA)
			.setTimestamp();

		const pageTwo = new MessageEmbed()
			.setAuthor(`${member.user.tag}'s Extended Family`, member.user.avatarURL())
			.setColor(0xFFFFFA)
			.setTimestamp();

		const pageThree = new MessageEmbed()
			.setAuthor(`${member.user.tag}'s In-Law Family`, member.user.avatarURL())
			.setColor(0xFFFFFA)
			.setTimestamp();

		let pageCount = 0;
		let pages = [];

		await message.channel.send('`Building family tree...`').then(async msg => {
			await wait(3000);

			pageCount++;
			pageOne.setDescription(descOne);
			pages.push(pageOne);

			switch(descTwo.length) {
			case 0:
				if(descThree.length > 0) {
					pageCount++;
					pageTwo.setDescription(descThree);
					pages.push(pageTwo);
				}
				break;
			default:
				pageCount++;
				pageTwo.setDescription(descTwo);
				pages.push(pageTwo);
				if(descThree.length > 0) {
					pageCount++;
					pageThree.setDescription(descThree);
					pages.push(pageThree);
				}
				break;
			}

			msg.delete();
		});


		if(pageCount === 1) return message.channel.send(pageOne);

		return paginationEmbed(message, pages, ['⬅️', '➡️'], 60000);

	} };