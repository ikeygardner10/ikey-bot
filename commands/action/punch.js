const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'punch',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: true,
		nsfw: false,
		description: 'Punch a user',
	},
	execute: async (client, message) => {

		// Define member, return if no member mentioned
		const member = message.mentions.members.first();
		if(!member) return('`Invalid (NO USER)`');

		// Define imageArray, select random image URL
		const punchArray = client.imageArrays.punch;
		const file = punchArray[(Math.floor(Math.random() * punchArray.length))];

		// Create basic embed
		const pEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		// Outline SQL commands
		const check = 'SELECT `messageCount` FROM `punchcount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `punchcount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		// Switch for self mentions
		switch(member.id) {
		case message.author.id:
			pEmbed.setDescription(`${message.author}... :clown:`);
			pEmbed.attachFiles('./images/self/punch.gif');
			pEmbed.setImage('attachment://punch.gif');
			break;
		default:
			pEmbed.setDescription(`${message.author} punched ${member}`);
			pEmbed.attachFiles(`./images/punch/${file}`);
			pEmbed.setImage(`attachment://${file}`);
		}

		// Define SQLpool, define SQL query
		const SQLpool = client.conPool.promise();
		const [rows] = await SQLpool.query(check, [message.author.id, member.id]);

		// Check database for existing record
		// If no record found, insert new row and return embed
		// Else +1 to messageCount, return embed and update row
		if(rows[0] === undefined) {
			const messageCount = 1;
			pEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
			message.channel.send(pEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success('[PUNCH CMD] messageCount record added'))
				.catch((error) => console.error(`[PUNCH CMD] ${error.stack}`));
		} else {
			const messageCount = rows[0].messageCount + 1;
			pEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
			message.channel.send(pEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success('[PUNCH CMD] messageCount record updated'))
				.catch((error) => console.error(`[PUNCH CMD] ${error.stack}`));
		}
	} };