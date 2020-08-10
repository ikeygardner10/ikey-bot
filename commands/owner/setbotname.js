/* eslint-disable no-unused-vars */
module.exports = {
	config: {
		name: 'setbotname',
		aliases: ['setname', 'sbn'],
		usage: '<new bot name>',
		cooldown: 10,
		category: 'owner',
		permissions: 'Bot Owner',
		args: true,
		description: 'Change the name of the bot account',
	},
	execute: async (client, message, args) => {

		try {

			const name = args.join(' ');

			await client.user.setUsername(name)
				.then(() => {
					return message.channel.send(`My new username is **${name}**`);
				}).catch((error) => {
					console.error(`[SBN CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});

		} catch(error) {
			console.error(`[SBN CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	},
};