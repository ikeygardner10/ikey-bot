const { MessageEmbed } = require('discord.js');

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
	execute: async (client, message) => {

		const member = message.mentions.members.first(); if(!member) return message.channel.send('`Invalid (NO USER)');
		const fuckArray = client.imageArrays.fuck; const file = fuckArray[(Math.floor(Math.random() * fuckArray.length))];
		let messageCount = 1;

		const yes = ['yes', 'yea', 'ye', 'yeah', 'y', 'ya', 'yah']; const no = ['no', 'na', 'nah', 'nope', 'never', 'ew'];
		const filter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) || no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id);
		};

		const check = 'SELECT `messageCount` FROM `fuckcount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `fuckcount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		const fEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		try {
			const SQLpool = client.conPool.promise();
			const [rows] = await SQLpool.query(check, [message.author.id, member.id]);
			message.channel.send(`${member}, you and ${message.author}, sex... now? :hot_face:`).then(() => {
				message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
					.then(collected => {
						if(yes.includes(collected.first().content.toLowerCase())) {
							switch(member.id) {
							case message.author.id:
								fEmbed.setDescription(`${message.author}... :clown:`);
								fEmbed.attachFiles('./images/Self/fuck.gif');
								fEmbed.setImage('attachment://fuck.gif');
								break;
							default:
								fEmbed.setDescription(`${message.author} and ${member}`);
								fEmbed.attachFiles(`./images/Fuck/${file}`);
								fEmbed.setImage(`attachment://${file}`);
							}
							if(rows[0] !== undefined) {
								messageCount = rows[0].messageCount + 1;
								fEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
								message.channel.send(fEmbed);
								return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
									.then(() => console.success('[FUCK CMD] messageCount record updated'))
									.catch((error) => console.error(`[FUCK CMD] ${error.stack}`));
							} else {
								fEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
								message.channel.send(fEmbed);
								return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
									.then(() => console.success('[FUCK CMD] messageCount record added'))
									.catch((error) => console.error(`[FUCK CMD] ${error.stack}`));
							}
						} else if(no.includes(collected.first().content.toLowerCase())) {
							fEmbed.setDescription(`${member} said no! :sob:`);
							fEmbed.attachFiles('./images/Self/fuckno.gif');
							fEmbed.setImage('attachment://fuckno.gif');
							return message.channel.send(fEmbed);
						}
					}).catch((timeout) => {
						console.info(`[FUCK] ${JSON.stringify(timeout)}`);
						return message.channel.send(`${message.author}, no response :pensive:`);
					});
			});
		} catch(error) {
			console.error(`[FUCK CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };