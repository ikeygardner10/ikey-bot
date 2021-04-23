/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const { MessageEmbed } = require('discord.js');
const wait = require('util').promisify(setTimeout);

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

		const pageOne = new MessageEmbed()
			.setAuthor(`${member.user.tag}'s Close Family`, member.user.avatarURL())
			.setColor(0xFFFFFA)
			.setTimestamp();

		const pageTwo = new MessageEmbed()
			.setAuthor(`${member.user.tag}'s Extended Family`, member.user.avatarURL())
			.setColor(0xFFFFFA)
			.setTimestamp();

		const SQLpool = client.conPool.promise();

		let descOne = ''; let descTwo = '';
		let formattedDate; let adoptedDate;
		let nuclearFamilyID; let parentsFamilyID;
		let parentOne; let parentTwo;
		let parentOneID; let parentTwoID;
		let parentOneFamilyID; let parentTwoFamilyID;
		let adopted = false; let married = false;

		const dateCleaner = (yuckDate) => {
			const cleanDate = yuckDate.match(/(\s[a-zA-Z0-9]*){3}/);
			return cleanDate[0];
		};

		const sqlFunc = async (stmt, vars, column, ID, guildID, descType, dateType) => {
			const [rows] = await SQLpool.query(stmt, vars);
			console.info(`[FAMILY CMD] Querying database for ${column}: ${ID} in guild: ${guildID}`);
			if(rows[0]) {
				switch(column) {
				case 'partner': {
					nuclearFamilyID = rows[0].familyID;
					formattedDate = await dateCleaner(rows[0].createdAt.toString());
					let partnerID = rows[0].userID; if(member.id === partnerID) partnerID = rows[0].partnerID;
					let partner = await guild.members.fetch(partnerID).catch(() => partner = `<@${partnerID}>`);
					return descOne += `**${descType}:** ${partner.displayName ? partner.displayName : partner}\n**${dateType}:** ${formattedDate}\n`;
				}
				case 'children': {
					await rows.forEach(async row => {
						formattedDate = await dateCleaner(row.createdAt.toString());
						let childID = row.childID;
						let child = await guild.members.fetch(childID).catch(() => child = `<@${childID}>`);
						return descOne += `\n**${descType}:** ${child.displayName ? child.displayName : child}\n**${dateType}:** ${formattedDate}`;
					});
					break;
				}
				case 'parents': {
					formattedDate = await dateCleaner(adoptedDate);
					parentOneID = rows[0].userID;
					parentTwoID = rows[0].partnerID;
					parentOne = await guild.members.fetch(parentOneID).displayName; if(parentOne === undefined) parentOne = `<@${parentOneID}>`;
					parentTwo = await guild.members.fetch(parentTwoID).displayName; if(parentTwo === undefined) parentTwo = `<@${parentTwoID}>`;
					return descOne += `\n\n**${descType}:** ${parentOne} & ${parentTwo}\n**${dateType}:** ${formattedDate}\n`;
				}
				case 'siblings': {
					await rows.forEach(async row => {
						let childID = row.childID; if(childID === member.id) return;
						let child = await guild.members.fetch(childID).catch(() => child = `<@${childID}>`);
						return descOne += `\n**${descType}:** ${child.displayName ? child.displayName : child}`;
					});
					break;
				}
				case 'parentOne parents': {
					let gParentOneID = rows[0].userID; let gParentTwoID = rows[0].partnerID;
					let gParentOne = await guild.members.fetch(gParentOneID).catch(() => gParentOne = `<@${gParentOneID}>`);
					let gParentTwo = await guild.members.fetch(gParentTwoID).catch(() => gParentTwo = `<@${gParentTwoID}>`);
					return descTwo += `**${descType}:** ${gParentOne.displayName ? gParentOne.displayName : gParentOne} & ${gParentTwo.displayName ? gParentTwo.displayName : gParentTwo}\n`;
				}
				case 'parentTwo parents': {
					let gParentOneID = rows[0].userID; let gParentTwoID = rows[0].partnerID;
					let gParentOne = await guild.members.fetch(gParentOneID).catch(() => gParentOne = `<@${gParentOneID}>`);
					let gParentTwo = await guild.members.fetch(gParentTwoID).catch(() => gParentTwo = `<@${gParentTwoID}>`);
					return descTwo += `\n\n**${descType}:** ${gParentOne.displayName ? gParentOne.displayName : gParentOne} & ${gParentTwo.displayName ? gParentTwo.displayName : gParentTwo}\n`;
				}
				case 'parentOne siblings': {
					await rows.forEach(async row => {
						let childID = row.childID; if(childID === parentOneID || childID === parentTwoID) return;
						let child = await guild.members.fetch(childID).catch(() => child = `<@${childID}>`);
						return descTwo += `\n**${descType}:** ${child.displayName ? child.displayName : child}`;
					});
					break;
				}
				case 'parentTwo siblings': {
					await rows.forEach(async row => {
						let childID = row.childID; if(childID === parentOneID || childID === parentTwoID) return;
						let child = await guild.members.fetch(childID).catch(() => child = `<@${childID}>`);
						return descTwo += `\n**${descType}:** ${child.displayName ? child.displayName : child}`;
					});
					break;
				}
				case 'child': {
					adoptedDate = rows[0].createdAt.toString();
					return parentsFamilyID = rows[0].familyID;
				}
				case 'parentOne adoption': {
					return parentOneFamilyID = rows[0].familyID;
				}
				case 'parentTwo adoption': {
					return parentTwoFamilyID = rows[0].familyID;
				}
				}
			} else {
				return console.info(`[FAMILY CMD] No entry found for ${column}: ${ID} in guild: ${guildID}`);
			}
		};

		// Check to see if married
		let stmt = 'SELECT `userID`, `partnerID`, `familyID`, `createdAt` FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `guildID`=?;';
		let vars = [member.id, member.id, guild.id];
		await sqlFunc(stmt, vars, 'partner', member.id, guild.id, ':couple: Partner', ':calendar: Married');
		if(nuclearFamilyID) {
			married = true;
			// If married, check for adopted kids
			stmt = 'SELECT `childID`, `createdAt` FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';
			vars = [nuclearFamilyID, guild.id];
			await sqlFunc(stmt, vars, 'children', nuclearFamilyID, guild.id, ':child: Child', ':calendar: Adopted');
		}

		// Check to see if member adopted
		stmt = 'SELECT `familyID`, `createdAt` FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
		vars = [member.id, guild.id];
		await sqlFunc(stmt, vars, 'child', member.id, guild.id, '', '');
		if(parentsFamilyID) {
			// If they are adopted, grab parents
			stmt = 'SELECT `userID`, `partnerID`, `createdAt` FROM `marriages` WHERE `familyID`=? AND `guildID`=?;';
			vars = [parentsFamilyID, guild.id];
			await sqlFunc(stmt, vars, 'parents', parentsFamilyID, guild.id, ':people_holding_hands: Parents', ':calendar:  Adopted');
			// Check for adopted siblings
			stmt = 'SELECT `childID` FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';
			vars = [parentsFamilyID, guild.id];
			await sqlFunc(stmt, vars, 'siblings', parentsFamilyID, guild.id, ':child: Sibling', '');
		}

		if(parentsFamilyID) {
			// Check for parentOne family
			stmt = 'SELECT `familyID` FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
			vars = [parentOneID, guild.id];
			await sqlFunc(stmt, vars, 'parentOne adoption', parentOneID, guild.id, '', '');
			if(parentOneFamilyID) {
				stmt = 'SELECT `userID`, `partnerID` FROM `marriages` WHERE `familyID`=? AND `guildID`=?;';
				vars = [parentOneFamilyID, guild.id];
				await sqlFunc(stmt, vars, 'parentOne parents', parentOneFamilyID, guild.id, ':older_adult: Grandparents', '');
				stmt = 'SELECT `childID` FROM `adoptions` WHERE `familyID`=? AND `guildID`=?';
				vars = [parentOneFamilyID, guild.id];
				await sqlFunc(stmt, vars, 'parentOne siblings', parentOneFamilyID, guild.id, ':adult: Aunt/Uncle', '');
			}
			stmt = 'SELECT `familyID` FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
			vars = [parentTwoID, guild.id];
			await sqlFunc(stmt, vars, 'parentTwo adoption', parentTwoID, guild.id, '', '');
			if(parentTwoFamilyID) {
				stmt = 'SELECT `userID`, `partnerID` FROM `marriages` WHERE `familyID`=? AND `guildID`=?;';
				vars = [parentTwoFamilyID, guild.id];
				await sqlFunc(stmt, vars, 'parentTwo parents', parentTwoFamilyID, guild.id, ':older_adult: Grandparents', '');
				stmt = 'SELECT `childID` FROM `adoptions` WHERE `familyID`=? AND `guildID`=?';
				vars = [parentTwoFamilyID, guild.id];
				await sqlFunc(stmt, vars, 'parentTwo siblings', parentTwoFamilyID, guild.id, ':adult: Aunt/Uncle', '');
			}
		}

		if(descOne.length === 0 && descTwo.length === 0) return message.channel.send('`Invalid (NO FAMILY)`');

		await message.channel.send('`Building family tree...`')
			.then(async msg => {
				await wait(1000);
				msg.delete();
			});

		let multiPage = false;
		if(descOne.length > 0 && descTwo.length > 0) {
			pageOne.setDescription(descOne);
			pageTwo.setDescription(descTwo);
			multiPage = true;
		}
		if(descOne.length > 0 && descTwo.length === 0) {
			pageOne.setDescription(descOne);
		}
		if(descOne.length === 0 && descTwo.length > 0) {
			pageOne.setDescription(descTwo);
		}

		let currentPage = pageOne;
		return message.channel.send(currentPage).then(msg => {
			if(multiPage === false) return;
			msg.react('➡️');
			const collector = msg.createReactionCollector((reaction, author) => ['⬅️', '➡️'].includes(reaction.emoji.name) && author.id === message.author.id, { time: 60000 });
			collector.on('collect', reaction => {
				msg.reactions.removeAll().then(async () => {
					if(reaction.emoji.name === '⬅️') currentPage = pageOne;
					if(reaction.emoji.name === '➡️') currentPage = pageTwo;
					msg.edit(currentPage);
					if(currentPage === pageTwo) await msg.react('⬅️');
					if(currentPage === pageOne) await msg.react('➡️');
				});
			});
		});
	} };