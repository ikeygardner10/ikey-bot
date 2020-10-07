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
		permissions: 'None',
		args: false,
		description: 'View server emojis',
	},
	execute: async (client, message) => {

		let emojis = message.guild.emojis.cache; let emojiArray = []; let currentIndex = 0;

		const generateEmbed = start => {
			const current = emojiArray.slice(start, start + 44);
			const eEmbed = new MessageEmbed()
				.setTimestamp()
				.setColor(0xFFFFFA)
				.setAuthor(`${message.guild.name}'s emojis`)
				.setDescription(`Emojis ${start + 1}-${start + current.length} out of ${emojiArray.length}\n\n${current.join(' ')}\n`);

			return eEmbed;
		};

		const sendEmbed = () => {
			message.channel.send(generateEmbed(0)).then(msg => {
				if(emojiArray.length <= 44) return;
				msg.react('➡️');
				const collector = msg.createReactionCollector((reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id, { time: 60000 });
				currentIndex = 0;
				collector.on('collect', reaction => {
					msg.reactions.removeAll().then(async () => {
						reaction.emoji.name === '⬅️' ? currentIndex -= 44 : currentIndex += 44;
						msg.edit(generateEmbed(currentIndex));
						if(currentIndex !== 0) await msg.react('⬅️');
						if(currentIndex + 44 < emojiArray.length) msg.react('➡️');
					});
				});
			});
		};


		try {
			await emojis.forEach(emoji => {
				emojiArray.push(emoji);
			});
			return sendEmbed();
		} catch(error) {
			console.error(`[EMOJIS CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };
