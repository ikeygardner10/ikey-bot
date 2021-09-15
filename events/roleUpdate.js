const { MessageEmbed } = require('discord.js');
const createChannel = require('../functions/createChannel');
const namer = require('color-namer');

module.exports = async (client, oldRole, newRole) => {

	const checkTracking = 'SELECT `roles`, `serverLogs` FROM `logsettings` WHERE `guildID`=?;';

	const SQLpool = client.conPool.promise();
	const [logRows] = await SQLpool.query(checkTracking, [oldRole.guild.id]);
	const [enabled, channel] = [logRows[0].roles, logRows[0].serverLogs];
	if(enabled === 0) return;

	const arrayEquals = (a, b) => {
		const aProps = Object.getOwnPropertyNames(a);
		const bProps = Object.getOwnPropertyNames(b);
		if(aProps.length != bProps.length) {
			return false;
		}
		for (let i = 0; i < aProps.length; i++) {
			const propName = aProps[i];
			if(a[propName] !== b[propName]) {
				return false;
			}
		}
		return true;
	};

	const differences = {}; const newPerms = []; const oldPerms = [];
	const names = namer(newRole.hexColor);
	Object.entries(newRole).forEach(([key, value]) => {
		switch(key) {
		case 'rawPosition':
			return;

		case 'permissions':
			if(arrayEquals(value.toArray(), oldRole.permissions.toArray()) === true) return;
			value.toArray().forEach(perm => {
				if(oldRole.permissions.toArray().includes(perm)) return;
				const formatted = perm.split('_').map(x => x[0] + x.slice(1).toLowerCase());
				newPerms.push(formatted.join(' '));
			});
			oldRole.permissions.toArray().forEach(perm => {
				if(value.toArray().includes(perm)) return;
				const formatted = perm.split('_').map(x => x[0] + x.slice(1).toLowerCase());
				oldPerms.push(formatted.join(' '));
			});
			return;

		case 'hoist':
			if(oldRole[key] === newRole[key]) return;
			return differences['display separately'] = value ? 'Yes' : 'No';

		case 'mentionable':
			if(oldRole[key] === newRole[key]) return;
			return differences['mentionable'] = value ? 'Yes' : 'No';

		case 'color':
			if(oldRole[key] === newRole[key]) return;
			return differences[key] = `${names.ntc[0].name} (${newRole.hexColor})`;

		case 'name':
			if(oldRole[key] === newRole[key]) return;
			return differences['old name'] = oldRole.name;

		default:
			if(value !== oldRole[key]) return differences[key] = value;
		}
	});

	if(Object.keys(differences).length === 0) return;

	let desc = `**Role:** ${newRole.name}\n`;
	Object.entries(differences).forEach(([key, value]) => {
		const formatted = function(str) {
			return str.replace(/\b(\w)/g, match => match.toUpperCase());
		};
		desc += `**${formatted(key)}:** ${value}\n`;
	});

	if(newPerms.length > 0) {
		desc += `\n**New Permissions:**\n${newPerms.join('\n')}\n`;
	}
	if(oldPerms.length > 0) {
		desc += `\n**Deleted Permissions:**\n${oldPerms.join('\n')}\n`;
	}

	const embed = new MessageEmbed()
		.setAuthor('Role Updated', newRole.guild.iconURL())
		.setDescription(desc)
		.setFooter(`ID: ${newRole.id}`)
		.setTimestamp()
		.setColor(newRole.hexColor);

	let logChannel = await newRole.guild.channels.cache.find(ch => ch.name === channel);
	if(!logChannel) {
		return createChannel(client, newRole.guild, 'server-logs', 'text', 500, 'server-logs', newRole.guild.id, ['VIEW_CHANNEL', 'SEND_MESSAGES'])
			.then(() => {
				logChannel = newRole.guild.channels.cache.find(ch => ch.name === 'server-logs');
				return logChannel.send(embed);
			})
			.catch((error) => {
				console.error(`[ROLE UPDATE] ${error.stack}`);
			});
	}
	else {
		return logChannel.send(embed);
	}

};