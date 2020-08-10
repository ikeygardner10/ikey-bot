/* eslint-disable no-shadow */
/* eslint-disable prefer-const */
const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'roles',
		noalias: 'No Aliases',
		aliases: [],
		usage: '',
		cooldown: 8,
		category: 'guild',
		permissions: 'Manage Roles',
		args: false,
		description: 'View server roles',
	},
	execute: (client, message) => {

		let list = message.guild.roles.cache.map(r => `${r}`).join(' ');

		const sendEmbeds = async function(text, channel) {
			const arr = text.match(/.{1,2048}/g);

			for (let list of arr) {
				let embed = new MessageEmbed()
					.setAuthor(`${message.guild.name} Roles`, message.guild.iconURL())
					.setDescription(list)
					.setFooter(`${client.user.username}`, client.user.avatarURL())
					.setColor(0xFFFFFA);

				await channel.send({ embed });
			}
		};

		try {
			sendEmbeds(list, message.channel);
		} catch(error) {
			console.error(`[ROLES CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };
