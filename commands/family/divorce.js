/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const YesNo = require('../../data/YesNo.json');

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

		const author = message.author; const member = message.mentions.members.first(); const guild = message.guild;
		let partnerOne; let partnerTwo; let familyID;

		const checkMarriages = 'SELECT * FROM `marriages` WHERE (`userID`=? OR `partnerID`=?) AND `guildID`=?;';
		const deleteMarriage = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `marriages` WHERE `familyID`=? AND `guildID`=?;';
		const checkAdoption = 'SELECT * FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';
		const deleteAdoption = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';

		const SQLpool = client.conPool.promise();

		try {

			const [authorRows] = await SQLpool.query(checkMarriages, [author.id, author.id, guild.id]);
			console.info(`[DIVORCE CMD] Querying database for user: ${author.id} in guild: ${guild.id}`);
			if(authorRows[0] === undefined) {
				console.info(`[DIVORCE CMD] No entry found for user: ${author.id} in guild: ${guild.id}, cancelling divorce`);
				return message.channel.send('`Invalid Divorce (YOU\'RE NOT MARRIED)`');
			}

			switch(authorRows[0].userID) {
			case author.id:
				partnerOne = authorRows[0].userID;
				partnerTwo = authorRows[0].partnerID;
				break;
			default:
				partnerOne = authorRows[0].partnerID;
				partnerTwo = authorRows[0].userID;
				break;
			}

			familyID = authorRows[0].familyID;

		} catch(error) {
			console.error(`[DIVORCE CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}

		const yes = YesNo.yes; const no = YesNo.no;
		const responseFilter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === author.id && response.author.id !== client.user.id) || no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === author.id);
		};

		console.info(`[DIVORCE CMD] Found marriage for user: ${author.id} in guild: ${guild.id}`);
		message.channel.send(`${author}, you are about to divorce <@${partnerTwo}>...\n\n**Are you sure?**`).then(() => {
			message.channel.awaitMessages(responseFilter, { max: 1, time: 15000, errors: ['time'] })
				.then(collected => {
					if(yes.includes(collected.first().content.toLowerCase())) {
						return SQLpool.query(deleteMarriage, [familyID, guild.id])
							.then(async () => {
								console.success(`[DIVORCE CMD] Marriage removed for users: ${author.id} & ${partnerTwo} in guild: ${guild.id}`);
								message.channel.send(`**${author} & <@${partnerTwo}> are no longer together :broken_heart: :sob:**`);
								const [adoptRows] = await SQLpool.query(checkAdoption, [familyID, guild.id]);
								if(adoptRows[0] !== undefined) {
									return SQLpool.query(deleteAdoption, [familyID, guild.id])
										.then(() => {
											return console.success(`[DIVORCE CMD] Adoption removed for user: ${adoptRows[0].childID} in guild: ${guild.id}`);
										})
										.catch((error) => {
											console.error(`[DIVORCE CMD] ${error.stack}`);
											return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
										});
								}
							})
							.catch((error) => {
								console.error(`[DIVORCE CMD] ${error.stack}`);
								return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
							});
					} else if(no.includes(collected.first().content.toLowerCase())) {
						console.info(`[DIVORCE CMD] ${author.id} cancelled the divorce`);
						return message.channel.send(`${author} cancelled the divorce! :heart:`);
					}
				}).catch((timeout) => {
					console.info(`[DIVORCE CMD] ${timeout}`);
					return message.channel.send(`${author}, no response, cancelled! :heart:`);
				});
		});
	} };