const { MessageEmbed } = require('discord.js');
const sendEmbed = require('../../functions/sendEmbed.js');
const getMember = require('../../functions/getMember');

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
			if(!banListArray[0]) return message.lineReply('`Invalid (NO BANNED USERS)`');
			return sendEmbed(message, banListArray, author, 15, '\n');
		}

		// Define member, return if no member mentioned
		const member = await getMember(message, args);
		if(member.id === message.author.id) return message.lineReply('`Invalid (MENTION USER/USER ID - NOT YOURSELF)`');

		// Define any arguments after a mentioned member as the reason
		// Join them to look pretty
		let restArgs;
		if(message.content.match(/<@!\d+?>/)) {
			[, ...restArgs] = args;
		}
		else {
			[...restArgs] = args;
		}

		const reason = restArgs.join(' ');

		// A few role checks, first define author, member & bot highest roles
		// Checks if member has admin/mod perms, return if true
		// Checks for author to member role, returns if member is equal or higher
		// Checks for bot to member role, returns if member is equal or higher
		if(message.author.id !== client.config.ownerID) {
			const authorrole = message.member.roles.highest;
			const memberrole = member.roles.highest;
			const botrole = message.guild.me.roles.highest;
			const perms = ['ADMINISTRATOR', 'BAN_MEMBERS', 'MANAGE_SERVER'];
			if(member.hasPermission(perms)) return message.lineReply('`Invalid (USER HAS ADMIN/MOD PERMISSIONS)`');
			if(authorrole.position <= memberrole.position) return message.lineReply('`Invalid (USERS ROLE HIGHER/EQUAL TO YOURS)`');
			if(memberrole.position >= botrole.position) return message.lineReply('`Invalid (USERS ROLE HIGHER/EQUAL TO MINE)`');
		}

		// Check to see if member is bannable, if all other checks succeed
		if(!message.guild.member(member.user).bannable) return message.lineReply('`Invalid (USER NOT BANNABLE)`');


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
				return message.lineReply(bEmbed);
			})
			.catch((error) => {
				console.error(`[BAN CMD] ${error.stack}`);
				return message.lineReply(`\`An error occured:\`\n\`\`\`${error}\`\`\``);
			});
	} };