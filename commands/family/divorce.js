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

		const author = message.author; let partnerOne; let partnerTwo; const guild = message.guild;
		const checkMarriages = 'SELECT `partnerOneID`, `partnerTwoID`, `guildID` FROM `marriages` WHERE (`partnerOneID`=? OR `partnerTwoID`=?) AND `guildID`=?;';
		const deleteMarriage = 'SET SQL_SAFE_UPDATES=0; DELETE FROM `marriages` WHERE `partnerOneID`=? AND `partnerTwoID`=? AND `guildID`=?;';

		const SQLpool = client.conPool.promise();

		try {

			const [authorRows] = await SQLpool.query(checkMarriages, [author.id, author.id, guild.id]);
			console.info(`[DIVORCE CMD] Querying database for user: ${author.id} in guild: ${guild.id}`);
			if(authorRows[0] === undefined) {
				console.info(`[DIVORCE CMD] No entry found for user: ${author.id} in guild: ${guild.id}, cancelling divorce`);
				return message.channel.send('`Invalid Divorce (YOU\'RE NOT MARRIED)`');
			}

			switch(authorRows[0].partnerOneID) {
			case author.id:
				partnerOne = authorRows[0].partnerOneID;
				partnerTwo = authorRows[0].partnerTwoID;
				break;
			default:
				partnerOne = authorRows[0].partnerTwoID;
				partnerTwo = authorRows[0].partnerOneID;
				break;
			}

		} catch(error) {
			console.error(`[DIVORCE CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}

		const yes = YesNo.yes; const no = YesNo.no;
		const responseFilter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === author.id) || no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === author.id);
		};

		console.info(`[DIVORCE CMD] Found marriage for user: ${author.id} in guild: ${guild.id}`);
		message.channel.send(`${author}, you are about to divorce <@${partnerTwo}>...\n\n**Are you sure?**`).then(() => {
			message.channel.awaitMessages(responseFilter, { max: 1, time: 15000, errors: ['time'] })
				.then(collected => {
					if(yes.includes(collected.first().content.toLowerCase())) {
						return SQLpool.query(deleteMarriage, [partnerOne, partnerTwo, guild.id])
							.then(() => {
								console.success(`[DIVORCE CMD] Marraige removed for users: ${author.id} & ${partnerTwo} in guild: ${guild.id}`);
								return message.channel.send(`**${author} & <@${partnerTwo}> are no longer together :broken_heart: :sob:**`);
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