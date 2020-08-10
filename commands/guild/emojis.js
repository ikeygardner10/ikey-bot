/* eslint-disable no-shadow */
/* eslint-disable prefer-const */
const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'emojis',
		noalias: 'No Aliases',
		aliases: [],
		usage: '',
		cooldown: 8,
		category: 'guild',
		permissions: 'Manage Emojis',
		args: false,
		description: 'View server emojis',
	},
	execute: async (client, message) => {

		let list = message.guild.emojis.cache.map(e => e).join(' ');

		async function sendEmbeds(text, channel) {
			const arr = text.match(/.{1,2048}>/g);

			for (let list of arr) {
				let embed = new MessageEmbed()
					.setAuthor(`${message.guild.name} Emojis`, message.guild.iconURL())
					.setDescription(list)
					.setFooter(`${client.user.username}`, client.user.avatarURL())
					.setColor(0xFFFFFA);

				await channel.send({ embed });
			}
		}
		try {
			sendEmbeds(list, message.channel);
		} catch(error) {
			console.error(`[EMOJIS CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };
