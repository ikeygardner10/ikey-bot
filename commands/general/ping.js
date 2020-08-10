/* eslint-disable no-unused-vars */
module.exports = {
	config: {
		name: 'ping',
		noalias: 'No Aliases',
		aliases: [],
		usage: '',
		cooldown: 10,
		category: 'general',
		permissions: '',
		args: false,
		description: 'API ping, displayed in MS',
	},
	execute: async (client, message, args) => {

		try {
			console.info(`[PING CMD] Ping: ${client.ws.ping}`);
			return message.channel.send(`Ping: \`${client.ws.ping}ms\``);
		} catch(error) {
			console.error(`[PING CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };