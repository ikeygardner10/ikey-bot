const paginationEmbed = async (msg, pages, emojiList = ['⏪', '⬅️', '➡️', '⏩', '⏹️'], timeout = 120000) => {
	if (!msg && !msg.channel) throw new Error('Channel is inaccessible.');
	if (!pages) throw new Error('Pages are not given.');
	if (emojiList.length !== 5) throw new Error('Need five emojis.');
	let page = 0;
	const curPage = await msg.channel.send(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));
	for (const emoji of emojiList) await curPage.react(emoji);
	const reactionCollector = curPage.createReactionCollector(
		(reaction, user) => emojiList.includes(reaction.emoji.name) && !user.bot,
		{ time: timeout },
	);
	reactionCollector.on('collect', reaction => {
		reaction.users.remove(msg.author);
		switch (reaction.emoji.name) {
		case emojiList[0]:
			page = page - 10 > 0 ? page - 10 : 0;
			break;
		case emojiList[1]:
			page = page > 0 ? --page : pages.length - 1;
			break;
		case emojiList[2]:
			page = page + 1 < pages.length ? ++page : 0;
			break;
		case emojiList[3]:
			page = page + 10 < pages.length ? page + 10 : 0;
			break;
		case emojiList[4]:
			reactionCollector.stop({ reason: 'User Canceled' });
			break;
		default:
			break;
		}
		curPage.edit(pages[page].setFooter(`Page ${page + 1} / ${pages.length}`));
		reactionCollector.resetTimer({ time: timeout });
	});
	reactionCollector.on('end', () => curPage.reactions.removeAll());
	return curPage;
};
module.exports = paginationEmbed;
