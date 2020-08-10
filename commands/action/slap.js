const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'slap',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: true,
		nsfw: false,
		description: 'Slap a user',
	},
	execute: async (client, message) => {

		const member = message.mentions.members.first(); if(!member) return('`Invalid (NO USER)`');
		const slapArray = client.imageArrays.slap; const file = slapArray[(Math.floor(Math.random() * slapArray.length))];
		let messageCount = 1;

		const check = 'SELECT `messageCount` FROM `slapcount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `slapcount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		const sEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		switch(member.id) {
		case message.author.id:
			sEmbed.setDescription(`${message.author}... :clown:`);
			sEmbed.attachFiles('./images/self/slap.gif');
			sEmbed.setImage('attachment://slap.gif');
			break;
		default:
			sEmbed.setDescription(`${message.author} slapped ${member}`);
			sEmbed.attachFiles(`./images/slap/${file}`);
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
					.then(() => console.success('[SLAP CMD] messageCount record updated'))
					.catch((error) => console.error(`[SLAP CMD] ${error.stack}`));
			} else {
				sEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
				message.channel.send(sEmbed);
				return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
					.then(() => console.success('[SLAP CMD] messageCount record added'))
					.catch((error) => console.error(`[SLAP CMD] ${error.stack}`));
			}
		} catch(error) {
			console.error(`[ CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };