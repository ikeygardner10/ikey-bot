/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const shortid = require('shortid');
const YesNo = require('../../data/YesNo.json');

module.exports = {
	config: {
		name: 'marry',
		aliases: ['my'],
		usage: '<@user>',
		cooldown: 10,
		category: 'family',
		permissions: '',
		args: false,
		description: 'Ask a person for their hand in marriage',
	},
	execute: async (client, message, args) => {

		return;

		const author = message.author;
		const member = message.mentions.members.first();
		const guild = message.guild;

		if(!member) return message.channel.send('`Invalid Proposal (NO USER MENTIONED)`');
		if(author.id === member.id) return message.channel.send('`Invalid Proposal (NO SOLOGAMY)`');

		const SQLpool = client.conPool.promise();
		const checkUsersMarriage = ';';
		const checkPartnerMarriage = ';';
		const checkRelations = ';';


		const [authorRows] = await SQLpool.query(checkMarriages, [author.id, author.id, guild.id]);
		console.info(`[MARRY CMD] Querying database for userID: ${author.id} in guild: ${guild.id}`);
		if(authorRows[0] !== undefined) {
			console.info(`[MARRY CMD] Entry found for userID: ${author.id} in guild: ${guild.id}, proposal cancelled`);
			return message.channel.send('`Invalid Proposal (YOU\'RE ALREADY MARRIED)`');
		}

		const [memberRows] = await SQLpool.query(checkMarriages, [member.id, member.id, guild.id]);
		console.info(`[MARRY CMD] Querying database for partnerID: ${member.id} in guild: ${guild.id}`);
		if(memberRows[0] !== undefined) {
			console.info(`[MARRY CMD] Entry found for partnerID: ${member.id} in guild: ${guild.id}, proposal cancelled`);
			return message.channel.send('`Invalid Proposal (PARTNER ALREADY MARRIED)`');
		}

		const [authorChildRows] = await SQLpool.query(checkAdoptions, [author.id, guild.id]);
		console.info(`[MARRY CMD] Querying database for children: ${author.id} in guild: ${guild.id}`);
		if(authorChildRows[0] !== undefined) {
			const authorFamilyID = authorChildRows[0].familyID;
			checkAdoptions = 'SELECT * FROM `adoptions` WHERE `familyID`=? AND `guildID`=?;';
			const [memberChildRows] = await SQLpool.query(checkAdoptions, [authorFamilyID, guild.id]);
			console.info(`[MARRY CMD] Querying database for matching familyID: ${authorFamilyID} in guild: ${guild.id}`);
			if(memberChildRows[0] !== undefined) {
				if(authorFamilyID === memberChildRows[0].familyID) {
					console.info(`[MARRY CMD] Entry found with matching familyID: ${authorFamilyID} in guild: ${guild.id}, cancelling proposal`);
					return message.channel.send('`Invalid Proposal (RELATED THROUGH ADOPTION)`');
				}
			}
		}

		const yes = YesNo.yes; const no = YesNo.no;
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
						return SQLpool.execute(addMarriage, [author.id, member.id, familyID, guild.id, createdAt])
							.then(() => {
								console.success(`[MARRY CMD] Marraige added for users: ${author.id} & ${member.id}`);
								return message.channel.send(`The wedding is to be held immediately.\n\n**Congratulations ${author} & ${member}! 🤵 👰**\n\nYou may now kiss :flushed:`);
							})
							.catch((error) => {
								console.error(`[MARRY CMD] ${error.stack}`);
								return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
							});
					} else if(no.includes(collected.first().content.toLowerCase())) {
						console.info(`[MARRY CMD] ${member.id} declined the proposal`);
						return message.channel.send(`${author}, ${member} declined the proposal! :sob:`);
					}
				}).catch((timeout) => {
					console.info(`[MARRY CMD] ${timeout}`);
					return message.channel.send(`${author}, no response! :sob:`);
				});
		});
	} };