/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const shortid = require('shortid');

module.exports = {
	config: {
		name: 'marry',
		aliases: ['m'],
		usage: '@user',
		cooldown: 10,
		category: 'family',
		permissions: '',
		args: true,
		description: 'Ask a person for their hand in marriage',
	},
	execute: async (client, message, args) => {

		const author = message.author; const member = message.mentions.members.first(); const guild = message.guild;
		if(!member) return message.channel.send('`Invalid Proposal (NO PARTNER)`'); if(author.id === member.id) return message.channel.send('`Invalid Proposal (NO SOLOGAMY)`');

		const checkMarriages = 'SELECT `partnerOneID`, `partnerTwoID` FROM `marriages` WHERE (`partnerOneID`=? OR `partnerTwoID`=?) AND `guildID`=?;';
		const addMarriage = 'INSERT INTO `marriages` (`partnerOneID`, `partnerTwoID`, `familyID`, `guildID`, `createdAt`) VALUES (?, ?, ?, ?, ?);';

		const SQLpool = client.conPool.promise();

		try {
			const [authorRows] = await SQLpool.query(checkMarriages, [author.id, author.id, guild.id]);
			console.info(`[MARRY CMD] Querying database for partnerOneID: ${author.id} in guild: ${guild.id}`);
			if(authorRows[0] !== undefined) {
				console.info(`[MARRY CMD] Entry found for partnerOneID: ${author.id} in guild: ${guild.id}, proposal cancelled`);
				return message.channel.send('`Invalid Proposal (YOU\'RE ALREADY MARRIED)`');
			}

			const [partnerRows] = await SQLpool.query(checkMarriages, [member.id, member.id, guild.id]);
			console.info(`[MARRY CMD] Querying database for partnerTwoID: ${member.id} in guild: ${guild.id}`);
			if(partnerRows[0] !== undefined) {
				console.info(`[MARRY CMD] Entry found for partnerTwoID: ${member.id} in guild: ${guild.id}, proposal cancelled`);
				return message.channel.send('`Invalid Proposal (PARTNER ALREADY MARRIED)`');
			}
		} catch(error) {
			console.error(`[MARRY CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}

		const yes = ['yes', 'yea', 'ye', 'yeah', 'y', 'ya', 'yah']; const no = ['no', 'na', 'nah', 'nope', 'never', 'ew'];
		const filter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) || no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id);
		};
		shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$@');
		const familyID = shortid.generate(); const createdAt = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

		console.info(`[MARRY CMD] No existing entries, sending proposal for ${author.id} & ${member.id}`);
		message.channel.send(`${member}, ${author} is proposing! :ring:\n\n**What do you say?**`).then(() => {
			message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
				.then(collected => {
					if(yes.includes(collected.first().content.toLowerCase())) {
						console.info(`[MARRY CMD] ${member.id} accepted proposal`);
						message.channel.send(`The wedding is to be held immediately.\n\n**Congratulations ${author} & ${member}! 🤵 👰**\n\nYou may now kiss :flushed:`);
						return SQLpool.execute(addMarriage, [author.id, member.id, familyID, message.guild.id, createdAt])
							.then(() => console.success(`[MARRY CMD] Marraige added for users: ${author.id} & ${member.id}`))
							.catch((error) => console.error(`[MARRY CMD] ${error.stack}`));
					} else if(no.includes(collected.first().content.toLowerCase())) {
						console.info(`[MARRY CMD] ${member.id} declined the proposal`);
						return message.channel.send(`${author}, ${member} declined the proposal! :sob:`);
					}
				}).catch((timeout) => {
					console.info(`[MARRY CMD] ${JSON.stringify(timeout)}`);
					return message.channel.send(`${author}, no response! :sob:`);
				});
		});
	} };