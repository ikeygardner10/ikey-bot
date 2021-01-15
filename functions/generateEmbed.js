/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');

module.exports = function(start, list, author, amount, joinBy, image) {
	const current = list.slice(start, start + amount);
	const embed = new MessageEmbed()
		.setThumbnail(image)
		.setTimestamp()
		.setColor(0xFFFFFA)
		.setAuthor(author);

	if(author.includes('Lyrics')) {
		embed.setDescription(`\n${current.join(joinBy)}\n`);
		embed.setFooter(`Page ${start + 1} of ${list.length}`);
	} else {
		embed.setDescription(`${current.join(joinBy)}\n`);
		embed.setFooter(`${start + 1} - ${start + current.length} of ${list.length}`);
	}

	return embed;
};