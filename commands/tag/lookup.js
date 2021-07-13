/* eslint-disable brace-style */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
const txtFormatter = require('../../functions/txtFormatter.js');
const { MessageEmbed } = require('discord.js');
const sendEmbed = require('../../functions/sendEmbed.js');

module.exports = {
	config: {
		name: 'lookup',
		aliases: ['lt'],
		usage: '<image name>',
		cooldown: 5,
		category: 'tag',
		permissions: '',
		args: false,
		description: '\nLookup tag data associated with an image',
	},
	execute: async (client, message, args) => {

		const getTag = 'SELECT * FROM `tags` WHERE `imageURL`=?;';
		const SQLpool = client.conPool.promise();
		let input;
		if(message.channel.type === 'dm') {
			input = message.content;
		}
		else {
			if(!args[0]) return message.channel.send('`Invalid Image (NO IMAGE)`');
			input = args[0];
		}
		// if(!input.includes('.png' || '.gif' || '.jpg' || '.jpeg', '.mp4', '.webm')) return message.channel.send('`Invalid Image Name (PLEASE INCLUDE FILE EXTENSION)`');
		const imageURL = `D:/images/tags/${input}`;

		const [rows] = await SQLpool.query(getTag, [imageURL]);
		if(!rows[0]) return message.channel.send('`Invalid Tag (NO TAG FOUND)`');

		const findUsername = (id) => {
			let user;
			try {
				user = client.users.cache.get(id).username;
			} catch {
				user = `Not Available - ID: ${id}`;
			}
			return user;
		};

		const findGuild = (id) => {
			let guild;
			try {
				guild = client.guilds.cache.get(id).name;
			} catch {
				guild = `Not Available - ID: ${id}`;
			}
			return guild;
		};

		const tagID = rows[0].id;
		const tagName = rows[0].tag;
		const tagContent = rows[0].content;
		const userID = rows[0].userID;
		const username = await findUsername(userID);
		let guildID = rows[0].guildCreated;
		if(rows[0].guildCreated === null) guildID = rows[0].guildID;
		const guildName = await findGuild(guildID);

		message.channel.send(`**Tag ID:** ${tagID}\n**Tag Name:** ${tagName}\n**Tag Owner:** ${username}\n**Tag Server:** ${guildName}`);
		return message.channel.send(`**Tag Content:**\n${tagContent}`, { files: [{ attachment: imageURL, name: input }] });

	} };
