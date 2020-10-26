const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'kick',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<@user> <reason (optional)>',
		cooldown: 2,
		category: 'admin',
		permissions: 'Kick Members',
		args: true,
		description: 'Kicks a member, with optional reasons',
	},
	execute: async (client, message, args) => {

		// Define member, return if no member mentioned
		const member = message.mentions.members.first();
		if(!member) return message.channel.send('Mention a user.');

		// A few role checks, first define author, member & bot highest roles
		// Checks if member has admin/mod perms, return if true
		// Checks for author to member role, returns if member is equal or higher
		// Checks for bot to member role, returns if member is equal or higher
		if(message.author.id !== client.config.ownerID) {
			const authorrole = message.member.roles.highest;
			const memberrole = member.roles.highest;
			const botrole = message.guild.me.roles.highest;
			const perms = ['ADMINISTRATOR', 'BAN_MEMBERS', 'MANAGE_SERVER', 'MUTE_MEMBERS'];
			if(member.hasPermission(perms)) return message.channel.send('`Invalid Permission (USER HAS KICK MEMBERS PERMISSIONS`');
			if(authorrole.position <= memberrole.position) return message.channel.send('`Invalid Permission (USERS ROLE HIGHER THAN YOURS)`');
			if(memberrole.position >= botrole.position) return message.channel.send('`Invalid Permission (USERS ROLE HIGHER THAN MINE)`');
		}

		// Check to see if member is kickable, if all other checks succeed
		if(!message.guild.member(member.user).bannable) return message.channel.send('`Invalid Permission (USER NOT KICKABLE)`');

		// Define any arguments after a mentioned member as the reason
		// Join them to look pretty
		const [, ...restArgs] = args;
		const reason = restArgs.join(' ');

		// Create basic embed
		const kEmbed = new MessageEmbed()
			.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
			.setTimestamp()
			.setColor(0xFFFFFA);
		
		// Return member kick, with optional reason, then returns embed, or fails and return error
		return member.kick({ reason: `${reason || 'No reason provided.'}` })
			.then(() => {
				kEmbed.setDescription(`**Result:** ${member} (ID: \`${member.id}\`) has been kicked.\n\n**Kicked By:** <@${message.author.id}>\n**Reason:** ${reason || 'No reason provided.'}`);
				console.success(`[KICK CMD] Kick success\nUser kicked: ${member.user.username}\nKicked by: ${message.member.username}`);
				return message.channel.send(kEmbed);
			})
			.catch((error) => {
				console.error(`[KICK CMD] ${error.stack}`);
				return message.channel.sned(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			});
	} };