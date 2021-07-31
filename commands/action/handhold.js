const { MessageEmbed } = require('discord.js');
const { yes, no, cancel } = require('../../data/arrayData.json');
const getMember = require('../../functions/getMember');

module.exports = {
	config: {
		name: 'handhold',
		aliases: ['hh'],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: false,
		nsfw: false,
		description: 'Ask a user to hold hands (15s timeout)',
	},
	execute: async (client, message, args) => {

		// Define member, return if no member mentioned
		const member = await getMember(message, args);

		// Define imageArray, select random image URL
		const handholdArray = client.imageArrays.handhold;
		const file = handholdArray[(Math.floor(Math.random() * handholdArray.length))];

		// Create basic embed
		const hEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		// Outline SQL statements
		const check = 'SELECT `messageCount` FROM `handholdcount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `handholdcount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		// Switch for self mentions
		switch(member.id) {
		case message.author.id:
			hEmbed.setDescription(`${message.author}... :pensive:`);
			hEmbed.attachFiles('D:/images/self/handhold.gif');
			hEmbed.setImage('attachment://handhold.gif');
			break;
		default:
			hEmbed.setDescription(`${message.author} and ${member}`);
			hEmbed.attachFiles(`D:/images/handhold/${file}`);
			hEmbed.setImage(`attachment://${file}`);
		}

		// Define yes/no, define response filter
		// Check for response author and response content
		const filter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) ||
			no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) ||
			cancel.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === message.author.id);
		};

		// Define SQLpool, define SQL query
		const SQLpool = client.conPool.promise();
		const [rows] = await SQLpool.query(check, [message.author.id, member.id]);

		let messageCount;
		let log;
		if(!rows[0]) {
			messageCount = 1;
			log = 'messageCount record added';
		}
		else {
			messageCount = rows[0].messageCount + 1;
			log = 'messageCount record updated';
		}

		// Send question to mentioned user, then create message collector
		// If response is yes, check for existing record, if undefined, create new else update
		// If response is no, redefine embed and return it, otherwise catch timeout (15s)
		if(message.author.id === member.id) {
			hEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
			message.lineReply(hEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success(`[HANDHOLD CMD] ${log}`))
				.catch((error) => console.error(`[HANDHOLD CMD] ${error.stack}`));
		}
		else {
			await message.channel.send(`${member}, ${message.author} wants to hold hands... do you accept? :flushed:`).then((msg) => {
				message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
					.then(collected => {
						if(yes.includes(collected.first().content.toLowerCase())) {
							hEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
							msg.lineReply(hEmbed);
							return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
								.then(() => console.success(`[HANDHOLD CMD] ${log}`))
								.catch((error) => console.error(`[HANDHOLD CMD] ${error.stack}`));
						}
						else if(no.includes(collected.first().content.toLowerCase())) {
							hEmbed.setDescription(`${member} said no! :sob:`);
							hEmbed.attachFiles('D:/images/self/handholdno.gif');
							hEmbed.setImage('attachment://handholdno.gif');
							return msg.lineReply(hEmbed);
						}
						else if(cancel.includes(collected.first().content.toLowerCase())) {
							console.info(`[ADOPT CMD] ${message.author.id} cancelled`);
							return msg.lineReply(`${message.author} cancelled! :sob:`);
						}
					}).catch(() => {
						return msg.lineReply(`${message.author}, no response :pensive:`);
					});
			});
		}
	} };