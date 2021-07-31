const { MessageEmbed } = require('discord.js');
const { yes, no, cancel } = require('../../data/arrayData.json');
const getMember = require('../../functions/getMember');

module.exports = {
	config: {
		name: 'fuck',
		aliases: ['sex'],
		usage: '<@user>',
		cooldown: 5,
		category: 'nsfw',
		permissions: '',
		args: true,
		nsfw: true,
		description: 'Mention a user to ask them to... :flushed: (15s timeout)',
	},
	execute: async (client, message, args) => {

		// Define member, return if no member mentioned
		const member = await getMember(message, args);

		const fuckArray = client.imageArrays.fuck;
		const file = fuckArray[(Math.floor(Math.random() * fuckArray.length))];

		const fEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		const check = 'SELECT `messageCount` FROM `fuckcount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `fuckcount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		switch(member.id) {
		case message.author.id:
			fEmbed.setDescription(`${message.author}... :clown:`);
			fEmbed.attachFiles('D:/images/self/fuck.gif');
			fEmbed.setImage('attachment://fuck.gif');
			break;
		default:
			fEmbed.setDescription(`${message.author} and ${member}`);
			fEmbed.attachFiles(`D:/images/fuck/${file}`);
			fEmbed.setImage(`attachment://${file}`);
		}

		const filter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) ||
			no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) ||
			cancel.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === message.author.id);
		};

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


		if(message.author.id === member.id) {
			fEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
			message.lineReply(fEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success(`[FUCK CMD] ${log}`))
				.catch((error) => console.error(`[FUCK CMD] ${error.stack}`));
		}
		else {
			await message.channel.send(`${member}, you and ${message.author}, sex... now? :hot_face:`).then((msg) => {
				message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
					.then(collected => {
						if(yes.includes(collected.first().content.toLowerCase())) {
							fEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
							msg.lineReply(fEmbed);
							return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
								.then(() => console.success(`[FUCK CMD] ${log}`))
								.catch((error) => console.error(`[FUCK CMD] ${error.stack}`));
						}
						else if(no.includes(collected.first().content.toLowerCase())) {
							fEmbed.setDescription(`${member} said no! :sob:`);
							fEmbed.attachFiles('D:/images/Self/fuckno.gif');
							fEmbed.setImage('attachment://fuckno.gif');
							return msg.lineReply(fEmbed);
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