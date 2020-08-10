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
			message.channel.send('Restarting...')
				.then(() => {
					client.destroy();
				}).then(() => {
					client.login(config.botToken).then(() => {
						return message.channel.send('Restarted!');
					}).catch((error) => {
						console.error(`[RESET CMD] ${error.stack}`);
						return message.channel.send('Failed to restart');
					});
				});
		}
		if(args[0].toLowerCase() === 'shutdown') {
			message.channel.send('Shutting down...')
				.then(msg => {
					client.destroy();
				}).catch((error) => {
					console.error(`[RESET CMD] ${error.stack}`);
					return message.channel.send('Failed to restart');
				});
		}
	},
};