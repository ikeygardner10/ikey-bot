const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'dodge',
		noalias: 'No Aliases',
		aliases: [],
		usage: '',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: false,
		nsfw: false,
		description: 'Dodge an attack (50% chance)',
	},
	execute: async (client, message) => {

		// Define dodge as random value, though set to 0.1 for botOwner (always succeed)
		let dodge = Math.random();
		if(message.author.id === client.config.ownerID) dodge = 0.1;

		// Create basic embed
		const dEmbed = new MessageEmbed()
			.setColor(0xFFFFFA)
			.setFooter(`${client.user.username}`, client.user.avatarURL());

		// Define imageArrays, select random image URLs
		const dodgesuccessArray = client.imageArrays.dodgesuccess;
		const fileS = dodgesuccessArray[(Math.floor(Math.random() * dodgesuccessArray.length))];
		const dodgefailArray = client.imageArrays.dodgefail;
		const fileF = dodgefailArray[(Math.floor(Math.random() * dodgefailArray.length))];

		// 50/50 chance, below .5 success, above .5 fail
		// Define rest of embed based on results
		if(dodge < 0.5) {
			dEmbed.setDescription(`${message.author} successfully dodged the attack!`);
			dEmbed.attachFiles(`D:/images/dodgesuccess/${fileS}`);
			dEmbed.setImage(`attachment://${fileS}`);
			return message.channel.send(dEmbed);
		} else if(dodge > 0.5) {
			dEmbed.setDescription(`${message.author} failed to dodge the attack! :open_mouth:`);
			dEmbed.attachFiles(`D:/images/dodgefail/${fileF}`);
			dEmbed.setImage(`attachment://${fileF}`);
			return message.channel.send(dEmbed);
		}
	} };