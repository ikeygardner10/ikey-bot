const { MessageEmbed } = require('discord.js');
const getMember = require('../../functions/getMember');

module.exports = {
	config: {
		name: 'bite',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: false,
		nsfw: false,
		description: 'Bite a user',
	},
	execute: async (client, message, args) => {

		// Define member, return if no member mentioned
		const member = await getMember(message, args);

		const biteArray = client.imageArrays.bite;
		const file = biteArray[(Math.floor(Math.random() * biteArray.length))];

		const cEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		const check = 'SELECT `messageCount`, `userID`, `memberID` FROM `bitecount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `chokecount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		switch(member.id) {
		case message.author.id:
			cEmbed.setDescription(`${message.author} fucking died`);
			cEmbed.attachFiles('D:/images/self/bite.gif');
			cEmbed.setImage('attachment://bite.gif');
			break;
		default:
			cEmbed.setDescription(`${message.author} bit ${member}`);
			cEmbed.attachFiles(`D:/images/bite/${file}`);
			cEmbed.setImage(`attachment://${file}`);
		}

		const SQLpool = client.conPool.promise();
		const [rows] = await SQLpool.query(check, [message.author.id, member.id]);

		let messageCount;
		let msg;
		if(!rows[0]) {
			messageCount = 1;
			msg = 'messageCount record added';
		}
		else {
			messageCount = rows[0].messageCount + 1;
			msg = 'messageCount record updated';
		}
		cEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
		message.lineReply(cEmbed);
		return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
			.then(() => console.success(`[BITE CMD] ${msg}`))
			.catch((error) => console.error(`[BITE CMD] ${error.stack}`));
	} };