const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'shoot',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: true,
		nsfw: false,
		description: 'Shoot a user',
	},
	execute: async (client, message) => {

		const member = message.mentions.members.first(); if(!member) return('`Invalid (NO USER)`');
		const shootArray = client.imageArrays.shoot; const file = shootArray[(Math.floor(Math.random() * shootArray.length))];
		let messageCount = 1;

		const check = 'SELECT `messageCount` FROM `shootcount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `shootcount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		const sEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		switch(member.id) {
		case message.author.id:
			sEmbed.setDescription(`${message.author}... but why?`);
			sEmbed.attachFiles('./images/self/shoot.gif');
			sEmbed.setImage('attachment://shoot.gif');
			break;
		default:
			sEmbed.setDescription(`${message.author} shot ${member}`);
			sEmbed.attachFiles(`./images/shoot/${file}`);
			sEmbed.setImage(`attachment://${file}`);
		}

		try {
			const SQLpool = client.conPool.promise();
			const [rows] = await SQLpool.query(check, [message.author.id, member.id]);
			if(rows[0] !== undefined) {
				messageCount = rows[0].messageCount + 1;
				sEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
				message.channel.send(sEmbed);
				return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
					.then(() => console.success('[SHOOT CMD] messageCount record updated'))
					.catch((error) => console.error(`[SHOOT CMD] ${error.stack}`));
			} else {
				sEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
				message.channel.send(sEmbed);
				return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
					.then(() => console.success('[SHOOT CMD] messageCount record added'))
					.catch((error) => console.error(`[SHOOT CMD] ${error.stack}`));
			}
		} catch(error) {
			console.error(`[SHOOT CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };