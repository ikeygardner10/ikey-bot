module.exports = async (message, args) => {

	const members = message.mentions.members;
	let member;
	if(!members.first()) {
		if(args[0] && args[0].match(/^[0-9]{18}$/)) {
			await message.guild.members.fetch(args[0]);
			member = message.guild.members.cache.get(args[0]);
		}
		else {
			member = message.member;
		}
	}
	else if(members.size === 1) {
		if(args[0] && args[0].match(/^[0-9]{18}$/)) {
			await message.guild.members.fetch(args[0]);
			member = message.guild.members.cache.get(args[0]);
		}
		else {
			member = message.mentions.members.first();
		}
	}
	else if(members.size === 2) {
		member = await message.guild.members.fetch(await message.mentions.members.lastKey());
	}
	else {
		let mention = await message.content.match(/<@!\d+?>/);
		mention = await mention.toString().match(/\d{18}/);
		member = await message.guild.members.cache.get(`${mention}`);
	}

	return member;

};