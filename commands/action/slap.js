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

		// Define member, return if no member mentioned
		const member = message.mentions.members.first();
		if(!member) return('`Invalid (NO USER)`');

		// Define imageArray, select random image URL
		const slapArray = client.imageArrays.slap;
		const file = slapArray[(Math.floor(Math.random() * slapArray.length))];

		// Create basic embed
		const sEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		// Outline SQL commands
		const check = 'SELECT `messageCount` FROM `slapcount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `slapcount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		// Switch for self mentions
		switch(member.id) {
		case message.author.id:
			sEmbed.setDescription(`${message.author}... :clown:`);
			sEmbed.attachFiles('D:/images/self/slap.gif');
			sEmbed.setImage('attachment://slap.gif');
			break;
		default:
			sEmbed.setDescription(`${message.author} slapped ${member}`);
			sEmbed.attachFiles(`D:/images/slap/${file}`);
			sEmbed.setImage(`attachment://${file}`);
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
				.then(() => console.success('[SLAP CMD] messageCount record added'))
				.catch((error) => console.error(`[SLAP CMD] ${error.stack}`));
		} else {
			const messageCount = rows[0].messageCount + 1;
			sEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
			message.channel.send(sEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success('[SLAP CMD] messageCount record updated'))
				.catch((error) => console.error(`[SLAP CMD] ${error.stack}`));
		}
	} };