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

		// Define member, return if no member mentioned
		const member = message.mentions.members.first();
		if(!member) return('`Invalid (NO USER)`');

		// Define imageArray, select random image URL
		const chokeArray = client.imageArrays.choke;
		const file = chokeArray[(Math.floor(Math.random() * chokeArray.length))];

		// Create basic embed
		const cEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		// Outline SQL statements
		const check = 'SELECT `messageCount`, `userID`, `memberID` FROM `chokecount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `chokecount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		// Switch for self mentions
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

		// Define SQLpool, define SQL query
		const SQLpool = client.conPool.promise();
		const [rows] = await SQLpool.query(check, [message.author.id, member.id]);

		// Check database for existing record
		// If no record found, insert new row and return embed
		// Else +1 to messageCount, return embed and update row
		if(rows[0] === undefined) {
			const messageCount = 1;
			cEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
			message.channel.send(cEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success('[CHOKE CMD] messageCount record added'))
				.catch((error) => console.error(`[CHOKE CMD] ${error.stack}`));
		} else {
			const messageCount = rows[0].messageCount + 1;
			cEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
			message.channel.send(cEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success('[CHOKE CMD] messageCount record updated'))
				.catch((error) => console.error(`[CHOKE CMD] ${error.stack}`));
		}
	} };