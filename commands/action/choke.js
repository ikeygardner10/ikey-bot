const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'choke',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: true,
		nsfw: false,
		description: 'Choke a user',
	},
	execute: async (client, message) => {

		const member = message.mentions.members.first(); if(!member) return('`Invalid (NO USER)`');
		const chokeArray = client.imageArrays.choke; const file = chokeArray[(Math.floor(Math.random() * chokeArray.length))];
		let messageCount = 1;

		const check = 'SELECT `messageCount` FROM `chokecount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `chokecount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		const cEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		switch(member.id) {
		case message.author.id:
			cEmbed.setDescription(`${message.author}... but why?`);
			cEmbed.attachFiles('./images/self/choke.gif');
			cEmbed.setImage('attachment://choke.gif');
			break;
		default:
			cEmbed.setDescription(`${message.author} choked ${member}`);
			cEmbed.attachFiles(`./images/choke/${file}`);
			cEmbed.setImage(`attachment://${file}`);
		}

		try {
			const SQLpool = client.conPool.promise();
			const [rows] = await SQLpool.query(check, [message.author.id, member.id]);
			if(rows[0] !== undefined) {
				messageCount = rows[0].messageCount + 1;
				cEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
				message.channel.send(cEmbed);
				return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
					.then(() => console.success('[CHOKE CMD] messageCount record updated'))
					.catch((error) => console.error(`[CHOKE CMD] ${error.stack}`));
			} else {
				cEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
				message.channel.send(cEmbed);
				return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
					.then(() => console.success('[CHOKE CMD] messageCount record added'))
					.catch((error) => console.error(`[CHOKE CMD] ${error.stack}`));
			}
		} catch(error) {
			console.error(`[CHOKE CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };