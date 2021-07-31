const { MessageEmbed } = require('discord.js');
const { yes, no, cancel } = require('../../data/arrayData.json');
const getMember = require('../../functions/getMember');

module.exports = {
	config: {
		name: 'dance',
		aliases: ['boogie'],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: false,
		nsfw: false,
		description: 'Dance with a user',
	},
	execute: async (client, message, args) => {

		const member = await getMember(message, args);

		let danceArray;
		let file;

		const cEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(0xFFFFFA);

		const check = 'SELECT `messageCount`, `userID`, `memberID` FROM `dancecount` WHERE `userID`= ? AND `memberID`= ?';
		const addUpdate = 'INSERT INTO `dancecount` (`userID`, `memberID`, `messageCount`) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE `messageCount`= `messageCount`+1';

		switch(member.id) {
		case message.author.id: {
			danceArray = client.imageArrays.singledance;
			file = danceArray[(Math.floor(Math.random() * danceArray.length))];
			cEmbed.setDescription(`${message.author} dancing at da club :sunglasses:`);
			cEmbed.attachFiles(`D:/images/singledance/${file}`);
			cEmbed.setImage(`attachment://${file}`);
			break;
		}
		default: {
			danceArray = client.imageArrays.doubledance;
			file = danceArray[(Math.floor(Math.random() * danceArray.length))];
			cEmbed.setDescription(`${message.author} dancing with ${member} :smiling_face_with_3_hearts:`);
			cEmbed.attachFiles(`D:/images/doubledance/${file}`);
			cEmbed.setImage(`attachment://${file}`);
		}
		}

		const filter = response => {
			return yes.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) ||
			no.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === member.id) ||
			cancel.some(msg => msg.toLowerCase() === response.content.toLowerCase() && response.author.id === message.author.id);
		};

		const SQLpool = client.conPool.promise();
		const [rows] = await SQLpool.query(check, [message.author.id, member.id]);

		let messageCount;
		let log;
		if(!rows[0]) {
			messageCount = 1;
			log = 'messageCount record added';
		}
		else {
			messageCount = rows[0].messageCount + 1;
			log = 'messageCount record updated';
		}

		if(message.author.id === member.id) {
			cEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
			await message.lineReply(cEmbed);
			return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
				.then(() => console.success(`[DANCE CMD] ${log}`))
				.catch((error) => console.error(`[DANCE CMD] ${error.stack}`));
		}
		else {
			await message.channel.send(`${member}, ${message.author} wants to dance... do you accept? :flushed:`).then((msg) => {
				message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ['time'] })
					.then(collected => {
						if(yes.includes(collected.first().content.toLowerCase())) {
							cEmbed.setFooter(`[${messageCount} times]`, client.user.avatarURL());
							msg.lineReply(cEmbed);
							return SQLpool.execute(addUpdate, [message.author.id, member.id, 1])
								.then(() => console.success(`[DANCE CMD] ${log}`))
								.catch((error) => console.error(`[DANCE CMD] ${error.stack}`));
						}
						else if(no.includes(collected.first().content.toLowerCase())) {
							cEmbed.setDescription(`${member} said no! :sob:`);
							cEmbed.attachFiles('D:/images/self/doubledanceno.gif');
							cEmbed.setImage('attachment://doubledanceno.gif');
							return msg.lineReply(cEmbed);
						}
						else if(cancel.includes(collected.first().content.toLowerCase())) {
							console.info(`[DANCE CMD] ${message.author.id} cancelled`);
							return msg.lineReply(`${message.author} cancelled! :sob:`);
						}
					}).catch((error) => {
						console.error(`[DANCE CMD] ${error.stack}`);
						return msg.lineReply(`${message.author}, no response :pensive:`);
					});
			});
		}
	} };