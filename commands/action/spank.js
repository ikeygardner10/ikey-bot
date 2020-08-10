const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'spank',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: true,
		nsfw: false,
		description: 'Mention a user to spank them',
	},
	execute: async (client, message) => {

		const member = message.mentions.members.first(); if(!member) return('`Invalid (NO USER)`');
		const spankArray = client.imageArrays.spank; const file = spankArray[(Math.floor(Math.random() * spankArray.length))];
		let messageCount = 1;

		const check = 'SELECT `messageCount` FROM `spankcount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `spankcount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		const sEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		switch(member.id) {
		case message.author.id:
			sEmbed.setDescription(`${message.author}... :flushed:`);
			sEmbed.attachFiles('./images/self/spank.gif');
			sEmbed.setImage('attachment://spank.gif');
			break;
		default:
			sEmbed.setDescription(`${message.author} spanked ${member}`);
			sEmbed.attachFiles(`./images/spank/${file}`);
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
					.then(() => console.success('[SPANK CMD] messageCount record updated'))
					.catch((error) => console.error(`[SPANK CMD] ${error.stack}`));
			} else {
				sEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
				message.channel.send(sEmbed);
				return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
					.then(() => console.success('[SPANK CMD] messageCount record added'))
					.catch((error) => console.error(`[SPANK CMD] ${error.stack}`));
			}
		} catch(error) {
			console.error(`[SPANK CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };