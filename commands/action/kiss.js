const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'kiss',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: true,
		nsfw: false,
		description: 'Kiss a user',
	},
	execute: async (client, message) => {

		// Define member, return if no member mentioned
		const member = message.mentions.members.first();
		if(!member) return('`Invalid (NO USER)`');

		// Define imageArray, select random image URL
		const kissArray = client.imageArrays.kiss;
		const file = kissArray[(Math.floor(Math.random() * kissArray.length))];

		// Create basic embed
		const kEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		// Outline SQL commands
		const check = 'SELECT `messageCount` FROM `kisscount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `kisscount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		// Outline SQL commands
		switch(member.id) {
		case message.author.id:
			kEmbed.setDescription(`${message.author}... :clown:`);
			kEmbed.attachFiles('./images/self/kiss.gif');
			kEmbed.setImage('attachment://kiss.gif');
			break;
		default:
			kEmbed.setDescription(`${message.author} kissed ${member}`);
			kEmbed.attachFiles(`./images/kiss/${file}`);
			kEmbed.setImage(`attachment://${file}`);
		}

		// Define SQLpool, define SQL query
		const SQLpool = client.conPool.promise();
		const [rows] = await SQLpool.query(check, [message.author.id, member.id]);

		// Check database for existing record
		// If no record found, insert new row and return embed
		// Else +1 to messageCount, return embed and update row
		if(rows[0] === undefined) {
			const messageCount = 1;
			kEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
			message.channel.send(kEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success('[KISS CMD] messageCount record added'))
				.catch((error) => console.error(`[KISS CMD] ${error.stack}`));
		} else {
			const messageCount = rows[0].messageCount + 1;
			kEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
			message.channel.send(kEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success('[KISS CMD] messageCount record updated'))
				.catch((error) => console.error(`[KISS CMD] ${error.stack}`));
		}
	} };