module.exports = {
	config: {
		name: 'kill',
		aliases: ['attack'],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: true,
		nsfw: false,
		description: 'Kill a user (33% chance Choke/Shoot/Stab)',
	},
	execute: async (client, message, args) => {

		const member = message.mentions.members.first(); if(!member) return message.channel.send('Invalid (NO USER)');
		const number = Math.random();

		try {
			if(number > 0.33) {
				return client.commands.get('choke').execute(client, message, args, member);
			} else if(number < 0.66) {
				return client.commands.get('shoot').execute(client, message, args, member);
			} else {
				return client.commands.get('stab').execute(client, message, args, member);
			}
		} catch(error) {
			console.error(`[KILL CMD] ${error.stack}`);
			return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
		}
	} };