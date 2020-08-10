const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'stab',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: true,
		nsfw: false,
		description: 'Stab a user',
	},
	execute: async (client, message) => {

		const member = message.mentions.members.first(); if(!member) return('`Invalid (NO USER)`');
		const stabArray = client.imageArrays.stab; const file = stabArray[(Math.floor(Math.random() * stabArray.length))];
		let messageCount = 1;

		const check = 'SELECT `messageCount` FROM `stabcount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `stabcount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		const sEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		switch(member.id) {
		case message.author.id:
			sEmbed.setDescription(`${message.author}... :clown:`);
			sEmbed.attachFiles('./images/self/stab.gif');
			sEmbed.setImage('attachment://stab.gif');
			break;
		default:
			sEmbed.setDescription(`${message.author} stabbed ${member}`);
			sEmbed.attachFiles(`./images/stab/${file}`);
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
					.then(() => console.success('[STAB CMD] messageCount record updated'))
					.catch((error) => console.error(`[STAB CMD] ${error.stack}`));
			} else {
				sEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
				message.channel.send(sEmbed);
				return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
					.then(() => console.success('[STAB CMD] messageCount record added'))
					.catch((error) => console.error(`[STAB CMD] ${error.stack}`));
			}
		} catch(error) {
			console.error(`[ CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };