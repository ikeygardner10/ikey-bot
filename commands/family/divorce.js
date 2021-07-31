/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const { yes, no, cancel } = require('../../data/arrayData.json');

module.exports = {
	config: {
		name: 'divorce',
		aliases: ['dv'],
		usage: '',
		cooldown: 10,
		category: 'family',
		permissions: '',
		args: false,
		description: 'Divorce your spouse',
	},
	execute: async (client, message, args) => {

		let partnerOne; let partnerTwo; let familyID;

		const checkMarriages = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `guildID`=?;';
		const deleteMarriage = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `marriages` WHERE `familyID`=? AND `guildID`=?;';
		const checkAdoption = 'SELECT * FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';
		const deleteAdoption = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';

		const SQLpool = client.conPool.promise();

		try {

			const [authorRows] = await SQLpool.query(checkMarriages, [message.author.id, message.author.id, message.guild.id]);
			console.info(`[DIVORCE CMD] Querying database for user: ${message.author.id} in guild: ${message.guild.id}`);
			if(authorRows[0] === undefined) {
				console.info(`[DIVORCE CMD] No entry found for user: ${message.author.id} in guild: ${message.guild.id}, cancelling divorce`);
				return message.lineReply('`Invalid (YOU\'RE NOT MARRIED)`');
			}

			switch(authorRows[0].userID) {
			case message.author.id:
				partnerOne = authorRows[0].userID;
				partnerTwo = authorRows[0].partnerID;
				break;
			default:
				partnerOne = authorRows[0].partnerID;
				partnerTwo = authorRows[0].userID;
				break;
			}

			familyID = authorRows[0].familyID;

		}
		catch(error) {
			console.error(`[DIVORCE CMD] ${error.stack}`);
			return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}

		const responseFilter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === message.author.id) ||
			no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === message.author.id);
		};

		console.info(`[DIVORCE CMD] Found marriage for user: ${message.author.id} in guild: ${message.guild.id}`);
		message.channel.send(`${message.author}, you are about to divorce <@${partnerTwo}>...\n\n**Are you sure?**`).then((msg) => {
			message.channel.awaitMessages(responseFilter, { max: 1, time: 15000, errors: ['time'] })
				.then(collected => {
					if(yes.includes(collected.first().content.toLowerCase())) {
						return SQLpool.query(deleteMarriage, [familyID, message.guild.id])
							.then(async () => {
								console.success(`[DIVORCE CMD] Marriage removed for users: ${message.author.id} & ${partnerTwo} in guild: ${message.guild.id}`);
								msg.lineReply(`**${message.author} & <@${partnerTwo}> are no longer together :broken_heart: :sob:**`);
								const [adoptRows] = await SQLpool.query(checkAdoption, [familyID, message.guild.id]);
								if(adoptRows[0] !== undefined) {
									return SQLpool.query(deleteAdoption, [familyID, message.guild.id])
										.then(() => {
											return console.success(`[DIVORCE CMD] Adoption removed for user: ${adoptRows[0].childID} in guild: ${message.guild.id}`);
										})
										.catch((error) => {
											console.error(`[DIVORCE CMD] ${error.stack}`);
											return msg.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
										});
								}
							})
							.catch((error) => {
								console.error(`[DIVORCE CMD] ${error.stack}`);
								return msg.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
							});
					}
					else if(no.includes(collected.first().content.toLowerCase())) {
						console.info(`[DIVORCE CMD] ${message.author.id} cancelled the divorce`);
						return msg.lineReply(`${message.author} cancelled the divorce! :heart:`);
					}
				}).catch((timeout) => {
					console.info(`[DIVORCE CMD] ${timeout}`);
					return msg.lineReply(`${message.author}, no response, cancelled! :heart:`);
				});
		});
	} };