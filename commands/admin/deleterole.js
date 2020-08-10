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

		const input = args.join(' ');
		if(!input) return message.channel.send('`Invalid (NO ROLE NAMED)`');

		const role = message.guild.roles.cache.find(r => r.name === input);
		if(!role) return message.channel.send('`Invalid (NO ROLE FOUND)`');

		const dEmbed = new MessageEmbed()
			.setThumbnail(message.guild.iconURL({ format: 'png', dynamic: true, size: 512 }))
			.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
			.setTimestamp()
			.setColor(0xFFFFFA);

		const authorrole = message.member.roles.highest; const botrole = message.guild.me.roles.highest;
		if(authorrole.position < role.position || authorrole.position === role.position) return message.channel.send('`Invalid Permission (ROLE IS HIGHER/EQUAL TO YOURS)`');
		if(role.position > botrole.position || role.position === botrole.position) return message.channel.send('`Invalid Permission (ROLE IS HIGHER/EQUAL TO MINE)`');

		return role.delete()
			.then((deleted) => {
				dEmbed.setDescription(`**Result:** **${deleted.name}** role has been deleted\n\n**Deleted By:** <@${message.author.id}>`);
				return message.channel.send(dEmbed);
			})
			.catch((error) => {
				console.error(`[DELROLE CMD] ${error.stack}`);
				return message.channel.sned(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			});
	} };