const { MessageEmbed } = require('discord.js');
const getMember = require('../../functions/getMember');

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
		const member = await getMember(message, args);
		if(!member) return message.lineReply('`Invalid (MENTION USER/USER ID)`');

		let restArgs;
		if(message.content.match(/<@!\d+?>/)) {
			[, ...restArgs] = args;
		}
		else {
			[...restArgs] = args;
		}

		const input = restArgs.join(' ');
		if(!input) return message.lineReply('`Invalid (SPECIFY ROLE)`');

		const role = message.guild.roles.cache.find(r => r.name === input);
		if(!role) return message.lineReply('`Invalid (NO ROLE FOUND)`');

		const rEmbed = new MessageEmbed()
			.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
			.setTimestamp()
			.setColor(0xFFFFFA);

		const authorrole = message.member.roles.highest; const botrole = message.guild.me.roles.highest;
		if(message.author.id !== client.config.ownerID) {
			if(authorrole.position === role.position) return message.lineReply('`Invalid (ROLE IS EQUAL TO YOURS)`');
			if(role.position > authorrole.position) return message.lineReply('`Invalid (ROLE IS HIGHER THAN YOURS)`');
		}
		if(role.position === botrole.position) return message.lineReply('`Invalid (ROLE IS EQUAL TO MINE)`');
		if(role.position > botrole.position) return message.lineReply('`Invalid (ROLE IS HIGHER THAN MINE)`');

		if(member.roles.cache.has(role.id)) {
			return member.roles.remove(role.id)
				.then(() => {
					rEmbed.setDescription(`**Result:** ${member} has been removed from the ${role} role.\n\n**Removed By:** <@${message.author.id}>`);
					return message.lineReply(rEmbed);
				})
				.catch((error) => {
					console.error(`[ROLE CMD] ${error.stack}`);
					return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
				});
		}
		else if(!member.roles.cache.has(role.id)) {
			return member.roles.add(role.id)
				.then(() => {
					rEmbed.setDescription(`**Result:** ${member} has been added to the ${role} role.\n\n**Added By:** <@${message.author.id}>`);
					return message.lineReply(rEmbed);
				})
				.catch((error) => {
					rEmbed.setDescription(`**Result:** I could not remove ${member} from the ${role} role.\n\n**Reason:** An error occured.\nIs the role higher than mine?\nDo I have sufficient permissions?`);
					console.error(`[ROLE CMD] ${error.stack}`);
					return message.lineReply(rEmbed);
				});
		}
		else {
			rEmbed.setDescription(`**Result:** I could not manage roles for ${member}.\n\n**Reason:** No member or role found.`);
			return message.lineReply(rEmbed);
		}
	} };