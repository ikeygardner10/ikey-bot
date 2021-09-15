/* eslint-disable brace-style */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const txtFormatter = require('../../functions/txtFormatter.js');
const { MessageEmbed } = require('discord.js');
const sendEmbed = require('../../functions/sendEmbed.js');
const getMember = require('../../functions/getMember');

module.exports = {
	config: {
		name: 'searchtag',
		aliases: ['st'],
		usage: '<tag name>/<@user>/server',
		cooldown: 5,
		category: 'tag',
		permissions: '',
		args: false,
		description: '\nSearch for an individual tag\nList users tags\nList server tags',
	},
	execute: async (client, message, args) => {

		// Outline SQL statements
		const checkUser = 'SELECT `tag`, `guildID` FROM `tags` WHERE `userID`=?;';
		const checkServer = 'SELECT `tag` FROM `tags` WHERE `guildID`=?;';
		const checkTag = 'SELECT `tag`, `userID`, `guildID` FROM `tags` WHERE BINARY `tag`=?;';
		const checkSelf = 'SELECT `tag`, `guildID` FROM `tags` WHERE `userID`=?;';

		// Define mentioned memeber, setup tagArray and format args
		const member = message.mentions.members.first();
		const tagArray = []; let author; let ntn;

		// Define SQLpool
		const SQLpool = client.conPool.promise();

		// If no args are given
		if(!args[0]) {

			// Define SQL query, if no tags are found, return
			const [selfRows] = await SQLpool.query(checkSelf, [message.author.id]);
			if(selfRows[0] === undefined) return message.lineReply(':mag: You have no tags');

			// Define author
			// Wait for each tag to be pushed to the array
			author = `${message.member.user.tag}'s tags`;
			await selfRows.forEach(tag => {
				ntn = txtFormatter(tag.tag);
				if(tag.guildID !== null) {
					return tagArray.push(ntn + ' (Server)');
				} else {
					return tagArray.push(ntn);
				}
			});

			return sendEmbed(message, tagArray, author, 15, '\n');
		}

		ntn = txtFormatter(args[0]);

		// If message mentions a member
		if(member) {

			// Define SQL query, if no tags are found, return
			const [userRows] = await SQLpool.query(checkUser, [member.id]);
			if(userRows[0] === undefined) return message.lineReply(':mag: No user tags found');

			// Define author
			// Wait for each tag found to be pushed to the array
			author = `${member.tag}'s tags`;
			await userRows.forEach(tag => {
				ntn = txtFormatter(tag.tag);
				if(tag.guildID !== null) {
					tagArray.push(ntn + ' (Server)');
				} else {
					tagArray.push(ntn);
				}
			});

			return sendEmbed(message, tagArray, author, 15, '\n');
		}

		// If args[0] matches a user id format
		if(args[0] && args[0].match(/^[0-9]{18}$/)) {

			// Define SQL query, if no tags are found, return
			const [idRows] = await SQLpool.query(checkUser, [args[0]]);
			if(idRows[0] === undefined) return message.lineReply(':mag: No user tags found');

			// Define author
			// Wait for each tag found to be pushed to the array
			await client.users.fetch(args[0]);
			author = `${client.users.cache.get(args[0]).tag || 'Unknown User'}'s tags`;
			await idRows.forEach(tag => {
				ntn = txtFormatter(tag.tag);
				if(tag.guildID !== null) {
					tagArray.push(ntn + ' (Server)');
				} else {
					tagArray.push(ntn);
				}
			});

			return sendEmbed(message, tagArray, author, 15, '\n');
		}

		// If args[0] matches 'server'
		if(args[0] === 'server') {

			// Define SQL query, if no tags are found, return
			const [serverRows] = await SQLpool.query(checkServer, [message.guild.id]);
			if(serverRows[0] === undefined) return message.lineReply(':mag: No server tags found');

			// Define author
			// Wait for each tag found to be pushed to the array
			author = `${message.guild.name}'s tags`;
			await serverRows.forEach(tag => {
				ntn = txtFormatter(tag.tag);
				tagArray.push(ntn);
			});

			return sendEmbed(message, tagArray, author, 15, '\n');
		}

		else {

			// Define SQL query, if no tags are found, return
			const [tagRows] = await SQLpool.query(checkTag, [ntn]);
			if(tagRows[0] === undefined) return message.lineReply(`:mag: No tag **${ntn}** found`);

			// Define author
			// Wait for each tag found to be pushed to the array
			author = `${ntn} details`;
			await client.users.fetch(tagRows[0].userID);
			await tagRows.forEach(tag => {
				ntn = txtFormatter(tag.tag);
				let user;
				try {
					user = client.users.cache.get(tag.userID).tag;
				} catch {
					user = 'Unknown User';
				}
				if(tag.guildID !== null) {
					if(tag.guildID !== message.guild.id) return;
					tagArray.push(`${ntn} *(Server)*\nOwner: ${user}\n`);
				} else {
					tagArray.push(`${ntn}\nOwner: ${user}\n`);
				}
			});

			return sendEmbed(message, tagArray, author, 15, '\n');
		}
	} };
