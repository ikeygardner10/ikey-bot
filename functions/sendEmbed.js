const generateEmbed = require('../functions/generateEmbed.js');

module.exports = function(message, list, author, amount, joinBy, image = '', timeout = 60000) {
	message.channel.send(generateEmbed(0, list, author, amount, joinBy, image)).then(msg => {
		if(list.length <= amount) return;
		msg.react('➡️');
		const collector = msg.createReactionCollector((reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id, { time: timeout });
		let currentIndex = 0;
		collector.on('collect', reaction => {
			msg.reactions.removeAll().then(async () => {
				reaction.emoji.name === '⬅️' ? currentIndex -= amount : currentIndex += amount;
				msg.edit(generateEmbed(currentIndex, list, author, amount, joinBy, image));
				if(currentIndex !== 0) await msg.react('⬅️');
				if(currentIndex + amount < list.length) await msg.react('➡️');
			});
		});
	});
};