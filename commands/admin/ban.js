const { MessageEmbed } = require('discord.js');
const sendEmbed = require('../../functions/sendEmbed.js');

module.exports = {
	config: {
		name: 'ban',
		noalias: 'No Aliases',
		aliases: [],
		usage: '<@user> <reason (optional)>/list',
		cooldown: 2,
		category: 'admin',
		permissions: 'Ban Members',
		args: true,
		description: '\nBans a member, with optional reasons\nOr view a list of banned members',
	},
	execute: async (client, message, args) => {

		// If arguments = list then return ban list
		if(args[0] === 'list') {

			// Define array to push bans into
			// Define embed author to pass to function
			const banListArray = [];
			const author = `${message.guild.name}'s ban list`;

			// Wait for all guild bans to fetch, then push to array
			await message.guild.fetchBans().then(banned => {
				banned.map(user => user.user.tag).forEach(ban => {
					banListArray.push(ban);
				});
			});

			// If there is no bans, return, else pass to embed function
			if(!banListArray[0]) return message.channel.send('`Invalid (NO BANNED USERS)`');
			return sendEmbed(message, banListArray, author, 15, '\n');
		}

		// Define member, return if no member mentioned
		let member = message.mentions.members.first();
		if(args[0] && args[0].match(/^[0-9]{18}$/)) {
			await message.guild.members.fetch(args[0]);
			member = message.guild.members.cache.get(args[0]);
		}
		if(!member) return message.channel.send('`Invalid (MENTION USER/USER ID)`');

		// A few role checks, first define author, member & bot highest roles
		// Checks if member has admin/mod perms, return if true
		// Checks for author to member role, returns if member is equal or higher
		// Checks for bot to member role, returns if member is equal or higher
		if(message.author.id !== client.config.ownerID) {
			const authorrole = message.member.roles.highest;
			const memberrole = member.roles.highest;
			const botrole = message.guild.me.roles.highest;
			const perms = ['ADMINISTRATOR', 'BAN_MEMBERS', 'MANAGE_SERVER'];
			if(member.hasPermission(perms)) return message.channel.send('`Invalid Permission (USER HAS ADMIN/MOD PERMISSIONS)`');
			if(authorrole.position <= memberrole.position) return message.channel.send('`Invalid Permission (USERS ROLE HIGHER/EQUAL TO YOURS)`');
			if(memberrole.position >= botrole.position) return message.channel.send('`Invalid Permission (USERS ROLE HIGHER/EQUAL TO MINE)`');
		}

		// Check to see if member is bannable, if all other checks succeed
		if(!message.guild.member(member.user).bannable) return message.channel.send('`Invalid Permission (USER NOT BANNABLE)`');

		// Define any arguments after a mentioned member as the reason
		// Join them to look pretty
		const [, ...restArgs] = args;
		const reason = restArgs.join(' ');

		// Create basic embed
		const bEmbed = new MessageEmbed()
			.setThumbnail(member.user.avatarURL({ format: 'png', dynamic: true, size: 512 }))
			.setFooter(`${message.guild.me.displayName}`, client.user.avatarURL())
			.setTimestamp()
			.setColor(0xFFFFFA);

		// Return member ban, with optional reason, then returns embed, or fails and return error
		return member.ban({ reason: `${reason || 'No reason provided.'}` })
			.then(() => {
				bEmbed.setDescription(`**Result:** ${member} (ID: \`${member.id}\`) has been banned\n\n**Banned By:** <@${message.author.id}>\n**Reason:** ${reason || 'No reason provided'}`);
				return message.channel.send(bEmbed);
			})
			.catch((error) => {
				console.error(`[BAN CMD] ${error.stack}`);
				return message.channel.send(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			});
	} };