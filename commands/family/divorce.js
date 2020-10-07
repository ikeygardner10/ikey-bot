/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */

module.exports = {
	config: {
		name: 'divorce',
		aliases: ['d'],
		usage: '@user',
		cooldown: 10,
		category: 'family',
		permissions: '',
		args: true,
		description: 'Divorce your spouse',
	},
	execute: async (client, message, args) => {

		const author = message.author; const member = message.mentions.members.first(); let partnerOne; let partnerTwo;
		if(!member) return message.channel.send('`Invalid Divorce (NO USER)`'); const guild = message.guild;
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

			console.info(`[DIVORCE CMD] Found marriage for user: ${author.id} in guild: ${guild.id}`);
			switch(authorRows[0].partnerOneID) {
			case author.id:
				if(authorRows[0].partnerTwoID !== member.id) {
					console.info(`[DIVORCE CMD] Not married to user: ${member.id} in guild: ${guild.id}, cancelling divorce`);
					return message.channel.send('`Invalid Divorce (NOT MARRIED TO USER)`');
				}
				partnerOne = author.id; partnerTwo = member.id;
				break;
			case member.id:
				if(authorRows[0].partnerTwoID !== author.id) {
					console.info(`[DIVORCE CMD] Not married to user: ${member.id} in guild: ${guild.id}, cancelling divorce`);
					return message.channel.send('`Invalid Divorce (NOT MARRIED TO USER)`');
				}
				partnerOne = member.id; partnerTwo = author.id;
				break;
			default:
				console.info(`[DIVORCE CMD] No entry found for user: ${author.id} in guild: ${guild.id}, cancelling divorce`);
				return message.channel.send('`Invalid Divorce (NOT MARRIED TO USER)`');
			}

		} catch(error) {
			console.error(`[DIVORCE CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}

		const yes = ['yes', 'yea', 'ye', 'yeah', 'y', 'ya', 'yah']; const no = ['no', 'na', 'nah', 'nope', 'never', 'ew'];
		const filter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === author.id) || no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === author.id);
		};

		message.channel.send(`${author}, you are about to divorce ${member}...\n\n**Are you sure?**`).then(() => {
			message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
				.then(collected => {
					if(yes.includes(collected.first().content.toLowerCase())) {
						return SQLpool.query(deleteMarriage, [partnerOne, partnerTwo, guild.id])
							.then(() => {
								console.success(`[DIVORCE CMD] Marraige removed for users: ${author.id} & ${member.id} in guild: ${guild.id}`);
								return message.channel.send(`**${author} & ${member} are no longer together :broken_heart: :sob:**`);
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
					console.info(`[MARRY CMD] ${JSON.stringify(timeout)}`);
					return message.channel.send(`${author}, no response! :sob:`);
				});
		});
	} };