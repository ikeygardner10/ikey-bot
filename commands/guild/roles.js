/* eslint-disable no-shadow */
/* eslint-disable prefer-const */
const sendEmbed = require('../../functions/sendEmbed.js');

module.exports = {
	config: {
		name: 'roles',
		noalias: 'No Aliases',
		aliases: [],
		usage: '',
		cooldown: 8,
		category: 'guild',
		permissions: 'None',
		args: false,
		description: 'View server roles',
	},
	execute: async (client, message) => {

		// Grab server roles, define roles array and embed author
		let roles = message.guild.roles.cache;
		let rolesArray = [];
		const author = `${message.guild.name}'s roles`;

		// Wait for all roles to be pushed to the array
		await roles.forEach(role => {
			rolesArray.push(role);
		});

		// If no server roles, return, else pass to embed function
		if(!rolesArray[0]) return message.channel.send('`Invalid (NO SERVER ROLES)`');
		return sendEmbed(message, rolesArray, author, 15, '\n');
	} };