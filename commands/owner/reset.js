/* eslint-disable no-unused-vars */
module.exports = {
	config: {
		name: 'reset',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<shutdown/restart>',
		cooldown: 1,
		category: 'owner',
		permissions: 'Bot Owner',
		args: true,
		description: 'Forces bot to either restart or shutdown',
	},
	execute: async (client, message, args, ready) => {

		if(args[0].toLowerCase() === 'reset' || args[0].toLowerCase() === 'restart') {
			message.lineReply('Restarting...')
				.then(() => {
					client.destroy();
				}).then(() => {
					client.login(client.config.botToken).then(() => {
						return message.lineReply('Restarted!');
					}).catch((error) => {
						console.error(`[RESET CMD] ${error.stack}`);
						return message.lineReply('Failed to restart');
					});
				});
		}
		if(args[0].toLowerCase() === 'shutdown') {
			message.lineReply('Shutting down...')
				.then(msg => {
					client.destroy();
				}).catch((error) => {
					console.error(`[RESET CMD] ${error.stack}`);
					return message.lineReply('Failed to restart');
				});
		}
	},
};