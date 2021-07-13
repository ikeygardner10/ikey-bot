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

		// Define member, return if no member mentioned
		const member = message.mentions.members.first();
		if(!member) return message.channel.send('`Invalid (NO USER)`');

		// Create basic embed
		const sEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		// Outline SQL commands
		const check = 'SELECT `messageCount` FROM `shootcount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `shootcount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		// Switch for self mentions
		switch(member.id) {
		case message.author.id: {
			const shootselfArray = client.imageArrays.shootself;
			const fileTwo = shootselfArray[(Math.floor(Math.random() * shootselfArray.length))];
			sEmbed.setDescription(`${message.author}... but why?`);
			sEmbed.attachFiles(`D:/images/shootself/${fileTwo}`);
			sEmbed.setImage(`attachment://${fileTwo}`);
			break;
		}
		default: {
			// Define imageArray, select random image URL
			const shootArray = client.imageArrays.shoot;
			const fileOne = shootArray[(Math.floor(Math.random() * shootArray.length))];
			sEmbed.setDescription(`${message.author} shot ${member}`);
			sEmbed.attachFiles(`D:/images/shoot/${fileOne}`);
			sEmbed.setImage(`attachment://${fileOne}`);
		}
		}

		// Define SQLpool, define SQL query
		const SQLpool = client.conPool.promise();
		const [rows] = await SQLpool.query(check, [message.author.id, member.id]);

		// Check database for existing record
		// If no record found, insert new row and return embed
		// Else +1 to messageCount, return embed and update row
		if(rows[0] === undefined) {
			const messageCount = 1;
			sEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
			message.channel.send(sEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success('[SHOOT CMD] messageCount record added'))
				.catch((error) => console.error(`[SHOOT CMD] ${error.stack}`));
		} else {
			const messageCount = rows[0].messageCount + 1;
			sEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
			message.channel.send(sEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success('[SHOOT CMD] messageCount record updated'))
				.catch((error) => console.error(`[SHOOT CMD] ${error.stack}`));
		}
	} };