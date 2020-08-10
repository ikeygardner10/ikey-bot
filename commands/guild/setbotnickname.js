/* eslint-disable no-unused-vars */
module.exports = {
	config: {
		name: 'setbotnickname',
		aliases: ['setbotnick', 'setnick', 'nickname'],
		usage: '<new bot nickname>',
		cooldown: 10,
		category: 'guild',
		permissions: 'Manage Nicknames',
		args: true,
		description: 'Change the name of the bot account',
	},
	execute: async (client, message, args) => {

		const name = args.join(' '); if(!name) return message.channel.send('No nickname given.');

		await message.guild.me.setNickname(name)
			.then(() => {
				return message.channel.send(`My new nickname is **${name}**`);
			}).catch((error) => {
				console.error(`[SBNICK CMD] ${error.stack}`);
				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			});
	} };