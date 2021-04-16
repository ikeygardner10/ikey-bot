const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'role',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<@user> <role name (case sensitive)>',
		cooldown: 5,
		category: 'admin',
		permissions: 'Manage Roles',
		args: true,
		description: 'Adds/removes a role to/from a user',
	},
	execute: async (client, message, args) => {

		// Define member and user, if ID is given, fetch member and user, redefine
		let member = message.guild.member(message.mentions.users.first());
		if(args[0] && args[0].match(/^[0-9]{18}$/)) {
			await message.guild.members.fetch(args[0]);
			member = message.guild.members.cache.get(args[0]);
		}
		if(!member) return message.channel.send('No user mentioned.');
		const [, ...restArgs] = args; const input = restArgs.join(' '); if(!input) return message.channel.send('Specify a role.');

		const role = message.guild.roles.cache.find(r => r.name === input);
		if(!role) return message.channel.send('No role found with that name.');

		const rEmbed = new MessageEmbed()
			.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
			.setTimestamp()
			.setColor(0xFFFFFA);

		if(message.author.id !== client.config.ownerID) {
			const authorrole = message.member.roles.highest; const botrole = message.guild.me.roles.highest;
			if(authorrole.position <= role.position) return message.channel.send('`Invalid Permission (ROLE IS HIGHER/EQUAL TO YOURS)`');
			if(role.position <= botrole.position) return message.channel.send('`Invalid Permission (ROLE IS HIGHER/EQUAL TO MINE)`');
		}

		if(member.roles.cache.has(role.id)) {
			return member.roles.remove(role.id)
				.then(() => {
					rEmbed.setDescription(`**Result:** ${member} has been removed from the ${role} role.\n\n**Removed By:** <@${message.author.id}>`);
					return message.channel.send(rEmbed);
				})
				.catch((error) => {
					console.error(`[ROLE CMD] ${error.stack}`);
					return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		} else if(!member.roles.cache.has(role.id)) {
			return member.roles.add(role.id)
				.then(() => {
					rEmbed.setDescription(`**Result:** ${member} has been added to the ${role} role.\n\n**Added By:** <@${message.author.id}>`);
					return message.channel.send(rEmbed);
				})
				.catch((error) => {
					rEmbed.setDescription(`**Result:** I could not remove ${member} from the ${role} role.\n\n**Reason:** An error occured.\nIs the role higher than mine?\nDo I have sufficient permissions?`);
					console.error(`[ROLE CMD] ${error.stack}`);
					return message.channel.send(rEmbed);
				});
		} else {
			rEmbed.setDescription(`**Result:** I could not manage roles for ${member}.\n\n**Reason:** No member or role found.`);
			return message.channel.send(rEmbed);
		}
	} };