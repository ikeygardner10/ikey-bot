const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'pat',
		aliases: ['pet'],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: true,
		nsfw: false,
		description: 'Pat a user',
	},
	execute: async (client, message) => {

		const member = message.mentions.members.first(); if(!member) return('`Invalid (NO USER)`');
		const patArray = client.imageArrays.pat; const file = patArray[(Math.floor(Math.random() * patArray.length))];
		let messageCount = 1;

		const check = 'SELECT `messageCount` FROM `patcount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `patcount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		const pEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		switch(member.id) {
		case message.author.id:
			pEmbed.setDescription(`${message.author}... :clown:`);
			pEmbed.attachFiles('./images/self/pat.gif');
			pEmbed.setImage('attachment://pat.gif');
			break;
		default:
			pEmbed.setDescription(`${message.author} pat ${member}`);
			pEmbed.attachFiles(`./images/pat/${file}`);
			pEmbed.setImage(`attachment://${file}`);
		}

		try {
			const SQLpool = client.conPool.promise();
			const [rows] = await SQLpool.query(check, [message.author.id, member.id]);
			if(rows[0] !== undefined) {
				messageCount = rows[0].messageCount + 1;
				pEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
				message.channel.send(pEmbed);
				return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
					.then(() => console.success('[PAT CMD] messageCount record updated'))
					.catch((error) => console.error(`[PAT CMD] ${error.stack}`));
			} else {
				pEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
				message.channel.send(pEmbed);
				return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
					.then(() => console.success('[PAT CMD] messageCount record added'))
					.catch((error) => console.error(`[PAT CMD] ${error.stack}`));
			}
		} catch(error) {
			console.error(`[PAT CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };