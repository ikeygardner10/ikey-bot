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

		const chokeArray = client.imageArrays.choke;
		const file = chokeArray[(Math.floor(Math.random() * chokeArray.length))];

		const cEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		const check = 'SELECT `messageCount`, `userID`, `memberID` FROM `chokecount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `chokecount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		switch(member.id) {
		case message.author.id:
			cEmbed.setDescription(`${message.author}... but why?`);
			cEmbed.attachFiles('D:/images/self/choke.gif');
			cEmbed.setImage('attachment://choke.gif');
			break;
		default:
			cEmbed.setDescription(`${message.author} choked ${member}`);
			cEmbed.attachFiles(`D:/images/choke/${file}`);
			cEmbed.setImage(`attachment://${file}`);
		}

		const SQLpool = client.conPool.promise();
		const [rows] = await SQLpool.query(check, [message.author.id, member.id]);

		let messageCount;
		let msg;
		if(!rows[0]) {
			messageCount = 1;
			msg = 'messageCount record added';
		} else {
			messageCount = rows[0].messageCount + 1;
			msg = 'messageCount record updated';
		}
		cEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
		message.channel.send(cEmbed);
		return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
			.then(() => console.success(`[CHOKE CMD] ${msg}`))
			.catch((error) => console.error(`[CHOKE CMD] ${error.stack}`));
	} };