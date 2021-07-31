const getMember = require('../../functions/getMember');

module.exports = {
	config: {
		name: 'kill',
		aliases: ['attack'],
		usage: '<@user>',
		cooldown: 5,
		category: 'action',
		permissions: '',
		args: false,
		nsfw: false,
		description: 'Kill a user (33% chance Choke/Shoot/Stab)',
	},
	execute: async (client, message, args) => {

		// Define member, return if no member mentioned
		const member = await getMember(message, args);

		// Define chace as random value
		const chance = Math.random();

		// 33% chance for each, below .33 choke, between .33 & .66 shoot, else stab
		// Execute command based on value, pass member through, command will do the rest
		if(chance < 0.33) {
			return client.commands.get('choke').execute(client, message, args, member);
		}
		else if(chance > 0.33 && chance < 0.66) {
			return client.commands.get('shoot').execute(client, message, args, member);
		}
		else {
			return client.commands.get('stab').execute(client, message, args, member);
		}
	} };