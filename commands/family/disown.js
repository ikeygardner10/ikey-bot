/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const { MessageEmbed } = require('discord.js');
const { yes, no, cancel } = require('../../data/arrayData.json');
const getMember = require('../../functions/getMember');

module.exports = {
	config: {
		name: 'disown',
		aliases: ['runaway', 'dw'],
		usage: '<@user (disown child)>/<blank (disown family)>',
		cooldown: 10,
		category: 'family',
		permissions: '',
		args: false,
		description: 'Disown your child/family',
	},
	execute: async (client, message, args) => {

		const member = await getMember(message, args);

		const checkParents = 'SELECT * FROM `marriages` WHERE `familyID`=? AND `guildID`=?;';
		const checkChild = 'SELECT * FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';
		const deleteAdoption = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `adoptions` WHERE `childID`=? AND `guildID`=?;';

		const SQLpool = client.conPool.promise();

		const [checkChildRows] = await SQLpool.query(checkChild, [member.id, message.guild.id]);
		console.info(`[DISOWN CMD] Querying database for adoption: ${member.id} in guild: ${message.guild.id}`);
		if(checkChildRows[0] === undefined) return message.lineReply('`Invalid (NOT ADOPTED)`');
		const familyID = checkChildRows[0].familyID;

		const [checkParentRows] = await SQLpool.query(checkParents, [familyID, message.guild.id]);
		console.info(`[DISOWN CMD] Querying database for parents: ${familyID} in guild: ${message.guild.id}`);
		if(checkParentRows[0] === undefined) return message.lineReply('`Invalid (NOT ADOPTED)`');
		const parentOne = checkParentRows[0].userID; const parentTwo = checkParentRows[0].partnerID;

		const responseFilter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === message.author.id) ||
			no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === message.author.id);
		};

		let questionMessage = `${message.author}, you are about to disown your child ${member}...\n\n**Are you sure?**`;
		let finalMessage = `**${message.author} has kicked ${member} from the family! :broken_heart: :sob:**`;
		if(!message.mentions.members.first()) {
			questionMessage = `${message.author}, you are about to disown your family & parents <@${parentOne}> & <@${parentTwo}>...\n\n**Are you sure?**`;
			finalMessage = `**${message.author} has left their family for good! :broken_heart: :sob:**`;
		}

		console.info(`[DISOWN CMD] Found existing adoption, sending confirmation to ${message.author}`);
		message.channel.send(questionMessage).then((msg) => {
			message.channel.awaitMessages(responseFilter, { max: 1, time: 15000, errors: ['time'] })
				.then(collected => {
					if(yes.includes(collected.first().content.toLowerCase())) {
						return SQLpool.query(deleteAdoption, [member.id, message.guild.id])
							.then(() => {
								console.success(`[DISOWN CMD] Adoption deleted for user: ${member.id} in guild: ${message.guild.id}`);
								return msg.lineReply(finalMessage);
							})
							.catch((error) => {
								console.error(`[DISOWN CMD] ${error.stack}`);
								return msg.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
							});
					}
					else if(no.includes(collected.first().content.toLowerCase())) {
						console.info(`[DISOWN CMD] ${message.author.id} cancelled the disownment`);
						return msg.lineReply(`${message.author} had a change of heart! :heart:`);
					}
				}).catch((timeout) => {
					console.info(`[DISOWN CMD] ${timeout}`);
					return msg.lineReply(`${message.author}, no response, cancelled! :heart:`);
				});
		});
	} };