/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');

module.exports = function(start, list, author, amount, joinBy) {
	const current = list.slice(start, start + amount);
	const embed = new MessageEmbed()
		.setTimestamp()
		.setColor(0xFFFFFA)
		.setAuthor(author);

	if(list.length > amount) embed.setDescription(`${start + 1}-${start + current.length} out of ${list.length}\n\n${current.join(joinBy)}\n`);
	if(list.length <= amount) embed.setDescription(`${current.join(joinBy)}\n`);

	return embed;
};