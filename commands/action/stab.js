const { MessageEmbed } = require('discord.js');
const getMember = require('../../functions/getMember');

module.exports = {
	config: {
		name: 'stab',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: false,
		nsfw: false,
		description: 'Stab a user',
	},
	execute: async (client, message, args) => {

		// Define member, return if no member mentioned
		const member = await getMember(message, args);

		// Define imageArray, select random image URL
		const stabArray = client.imageArrays.stab;
		const file = stabArray[(Math.floor(Math.random() * stabArray.length))];

		// Create basic embed
		const sEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		// Outline SQL commands
		const check = 'SELECT `messageCount` FROM `stabcount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `stabcount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		// Switch for self mentions
		switch(member.id) {
		case message.author.id:
			sEmbed.setDescription(`${message.author}... :clown:`);
			sEmbed.attachFiles('D:/images/self/stab.gif');
			sEmbed.setImage('attachment://stab.gif');
			break;
		default:
			sEmbed.setDescription(`${message.author} stabbed ${member}`);
			sEmbed.attachFiles(`D:/images/stab/${file}`);
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
			message.lineReply(sEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success('[STAB CMD] messageCount record added'))
				.catch((error) => console.error(`[STAB CMD] ${error.stack}`));
		}
		else {
			const messageCount = rows[0].messageCount + 1;
			sEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
			message.lineReply(sEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success('[STAB CMD] messageCount record updated'))
				.catch((error) => console.error(`[STAB CMD] ${error.stack}`));
		}
	} };