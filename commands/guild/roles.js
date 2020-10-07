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
		permissions: 'None',
		args: false,
		description: 'View server roles',
	},
	execute: async (client, message) => {

		let roles = message.guild.roles.cache; let rolesArray = []; let currentIndex = 0;

		const generateEmbed = start => {
			const current = rolesArray.slice(start, start + 15);
			const rEmbed = new MessageEmbed()
				.setTimestamp()
				.setColor(0xFFFFFA)
				.setAuthor(`${message.guild.name}'s roles`)
				.setDescription(`Roles ${start + 1}-${start + current.length} out of ${rolesArray.length}\n\n${current.join('\n')}\n`);

			return rEmbed;
		};

		const sendEmbed = () => {
			message.channel.send(generateEmbed(0)).then(msg => {
				if(rolesArray.length <= 15) return;
				msg.react('➡️');
				const collector = msg.createReactionCollector((reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 60000 });
				currentIndex = 0;
				collector.on('collect', reaction => {
					msg.reactions.removeAll().then(async () => {
						reaction.emoji.name === '⬅️' ? currentIndex -= 15 : currentIndex += 15;
						msg.edit(generateEmbed(currentIndex));
						if(currentIndex !== 0) await msg.react('⬅️');
						if(currentIndex + 15 < rolesArray.length) msg.react('➡️');
					});
				});
			});
		};


		try {
			await roles.forEach(role => {
				rolesArray.push(role);
			});
			return sendEmbed();
		} catch(error) {
			console.error(`[ROLES CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };