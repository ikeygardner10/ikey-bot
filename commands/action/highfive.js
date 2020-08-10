const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'highfive',
		aliases: ['hf'],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: true,
		nsfw: false,
		description: 'Highfive a user',
	},
	execute: async (client, message) => {

		const member = message.mentions.members.first(); if(!member) return('`Invalid (NO USER)`');
		const highfiveArray = client.imageArrays.highfive; const file = highfiveArray[(Math.floor(Math.random() * highfiveArray.length))];
		let messageCount = 1;

		const check = 'SELECT `messageCount` FROM `highfivecount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `highfivecount` (userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		const hEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		switch(member.id) {
		case message.author.id:
			hEmbed.setDescription(`${message.author}... but why?`);
			hEmbed.attachFiles('./images/self/highfive.gif');
			hEmbed.setImage('attachment://highfive.gif');
			break;
		default:
			hEmbed.setDescription(`${message.author} highfived ${member}`);
			hEmbed.attachFiles(`./images/highfive/${file}`);
			hEmbed.setImage(`attachment://${file}`);
		}

		try {
			const SQLpool = client.conPool.promise();
			const [rows] = await SQLpool.query(check, [message.author.id, member.id]);
			if(rows[0] !== undefined) {
				messageCount = rows[0].messageCount + 1;
				hEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
				message.channel.send(hEmbed);
				return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
					.then(() => console.success('[HIGHFIVE CMD] messageCount record updated'))
					.catch((error) => console.error(`[HIGHFIVE CMD] ${error.stack}`));
			} else {
				hEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
				message.channel.send(hEmbed);
				return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
					.then(() => console.success('[HIGHFIVE CMD] messageCount record added'))
					.catch((error) => console.error(`[HIGHFIVE CMD] ${error.stack}`));
			}
		} catch(error) {
			console.error(`[HIGHFIVE CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };