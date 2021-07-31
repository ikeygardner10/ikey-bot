const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'deleterole',
		aliases: ['dr', 'delrole', 'drole'],
		usage: '<role name (case sensitive)>',
		cooldown: 5,
		category: 'admin',
		permissions: 'Manage Roles',
		args: true,
		description: 'Deletes a server role',
	},
	execute: async (client, message, args) => {

		// Define input as args joined, return of no args
		const input = args.join(' ');
		if(!input) return message.lineReply('`Invalid (SPECIFY ROLE)`');

		// Wait for roles to fetch, search roles for input, return if no role found
		await message.guild.roles.fetch();
		const role = message.guild.roles.cache.find(r => r.name === input);
		if(!role) return message.lineReply('`Invalid (NO ROLE FOUND)`');

		// Create basic embed
		const dEmbed = new MessageEmbed()
			.setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true, size: 512 }))
			.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
			.setTimestamp()
			.setColor(0xFFFFFA);

		// Define highest roles for bot and author
		// If author role is equal or higher to role, return
		// If role position is equal or higher to the bots role, return
		if(message.author.id !== client.config.ownerID) {
			const authorrole = message.member.roles.highest;
			const botrole = message.guild.me.roles.highest;
			if(authorrole.position <= role.position) return message.lineReply('`Invalid (ROLE IS HIGHER/EQUAL TO YOURS)`');
			if(role.position >= botrole.position) return message.lineReply('`Invalid (ROLE IS HIGHER/EQUAL TO MINE)`');
		}

		// Return role delete, then define embed desc and return, or return error
		return role.delete()
			.then((deleted) => {
				dEmbed.setDescription(`**Result:** **${deleted.name}** role has been deleted\n\n**Deleted By:** <@${message.author.id}>`);
				return message.lineReply(dEmbed);
			})
			.catch((error) => {
				console.error(`[DELROLE CMD] ${error.stack}`);
				return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			});
	} };