const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'hug',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: true,
		nsfw: false,
		description: 'Hug a user',
	},
	execute: async (client, message) => {

		// Define member, return if no member mentioned
		const member = message.mentions.members.first();
		if(!member) return('`Invalid (NO USER)`');

		// Define imageArray, select random image URL
		const hugArray = client.imageArrays.hug;
		const file = hugArray[(Math.floor(Math.random() * hugArray.length))];

		// Create basic embed
		const hEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		// Outline SQL commands
		const check = 'SELECT `messageCount` FROM `hugcount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `hugcount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		// Switch for self mentions
		switch(member.id) {
		case message.author.id:
			hEmbed.setDescription(`${message.author}... :pensive:`);
			hEmbed.attachFiles('D:/images/self/hug.gif');
			hEmbed.setImage('attachment://hug.gif');
			break;
		default:
			hEmbed.setDescription(`${message.author} hugged ${member}`);
			hEmbed.attachFiles(`D:/images/hug/${file}`);
			hEmbed.setImage(`attachment://${file}`);
		}

		// Define SQLpool, define SQL query
		const SQLpool = client.conPool.promise();
		const [rows] = await SQLpool.query(check, [message.author.id, member.id]);

		// Check database for existing record
		// If no record found, insert new row and return embed
		// Else +1 to messageCount, return embed and update row
		if(rows[0] === undefined) {
			const messageCount = 1;
			hEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
			message.channel.send(hEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success('[HUG CMD] messageCount record added'))
				.catch((error) => console.error(`[HUG CMD] ${error.stack}`));
		} else {
			const messageCount = rows[0].messageCount + 1;
			hEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
			message.channel.send(hEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success('[HUG CMD] messageCount record updated'))
				.catch((error) => console.error(`[HUG CMD] ${error.stack}`));
		}
	} };