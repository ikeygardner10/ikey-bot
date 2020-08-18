const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'handhold',
		aliases: ['hh'],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: true,
		nsfw: false,
		description: 'Ask a user to hold hands (15s timeout)',
	},
	execute: async (client, message) => {

		const member = message.mentions.members.first(); if(!member) return message.channel.send('`Invalid (NO USER)');
		const handholdArray = client.imageArrays.handhold; const file = handholdArray[(Math.floor(Math.random() * handholdArray.length))];
		let messageCount = 1;

		const yes = ['yes', 'yea', 'ye', 'yeah', 'y', 'ya', 'yah']; const no = ['no', 'na', 'nah', 'nope', 'never', 'ew'];
		const filter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) || no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id);
		};

		const check = 'SELECT `messageCount` FROM `handholdcount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `handholdcount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		const hEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		try {
			const SQLpool = client.conPool.promise();
			const [rows] = await SQLpool.query(check, [message.author.id, member.id]);
			message.channel.send(`${member}, ${message.author} wants to hold hands... do you accept? :flushed:`).then(() => {
				message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
					.then(collected => {
						if(yes.includes(collected.first().content.toLowerCase())) {
							switch(member.id) {
							case message.author.id:
								hEmbed.setDescription(`${message.author}... :pensive:`);
								hEmbed.attachFiles('./images/self/handhold.gif');
								hEmbed.setImage('attachment://handhold.gif');
								break;
							default:
								hEmbed.setDescription(`${message.author} and ${member}`);
								hEmbed.attachFiles(`./images/handhold/${file}`);
								hEmbed.setImage(`attachment://${file}`);
							}
							if(rows[0] !== undefined) {
								messageCount = rows[0].messageCount + 1;
								hEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
								message.channel.send(hEmbed);
								return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
									.then(() => console.success('[HANDHOLD CMD] messageCount record updated'))
									.catch((error) => console.error(`[HANDHOLD CMD] ${error.stack}`));
							} else {
								hEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
								message.channel.send(hEmbed);
								return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
									.then(() => console.success('[HANDHOLD CMD] messageCount record added'))
									.catch((error) => console.error(`[HANDHOLD CMD] ${error.stack}`));
							}
						} else if(no.includes(collected.first().content.toLowerCase())) {
							hEmbed.setDescription(`${member} said no! :sob:`);
							hEmbed.attachFiles('./images/self/handholdno.gif');
							hEmbed.setImage('attachment://handholdno.gif');
							return message.channel.send(hEmbed);
						}
					}).catch((timeout) => {
						console.info(`[HANDHOLD CMD] ${JSON.stringify(timeout)}`);
						return message.channel.send(`${message.author}, no response :pensive:`);
					});
			});
		} catch(error) {
			console.error(`[HANDHOLD CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };