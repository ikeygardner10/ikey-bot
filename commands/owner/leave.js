module.exports = {
	config: {
		name: 'leave',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<guild ID>',
		cooldown: 1,
		category: 'owner',
		permissions: 'Bot Owner',
		args: true,
		description: 'Forces bot to leave guild',
	},
	execute: async (client, message, args) => {

		try {

			client.guilds.cache.get(args.join(' ')).leave();
			return console.log('Left the guild.');

		} catch(error) {
			console.error(`[LEAVE CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	},
};