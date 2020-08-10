const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'dodge',
		noalias: 'No Aliases',
		aliases: [],
		usage: '',
		cooldown: 3,
		category: 'action',
		permissions: '',
		args: false,
		nsfw: false,
		description: 'Dodge an attack (50% chance)',
	},
	execute: async (client, message) => {

		let dodge = Math.random(); if(message.author.id === client.config.ownerID) dodge = 0.1;

		const dEmbed = new MessageEmbed()
			.setColor(0xFFFFFA)
			.setFooter('Ikey Bot', client.user.avatarURL());

		try {
			if(dodge < 0.5) {
				const dodgesuccessArray = client.imageArrays.dodgesuccess;
				const file = dodgesuccessArray[(Math.floor(Math.random() * dodgesuccessArray.length))];
				dEmbed.setDescription(`${message.author} successfully dodged the attack!`);
				dEmbed.attachFiles(`./images/dodgeduccess/${file}`);
				dEmbed.setImage(`attachment://${file}`);
				return message.channel.send(dEmbed);
			} else if(dodge > 0.5) {
				const dodgefailArray = client.imageArrays.dodgefail;
				const file = dodgefailArray[(Math.floor(Math.random() * dodgefailArray.length))];
				dEmbed.setDescription(`${message.author} failed to dodge the attack! :open_mouth:`);
				dEmbed.attachFiles(`./images/dodgefail/${file}`);
				dEmbed.setImage(`attachment://${file}`);
				return message.channel.send(dEmbed);
			}
		} catch(error) {
			console.error(`[DODGE CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };