module.exports = async (client, message) => {

    const getOwner = client.users.cache.get(client.config.ownerID);
    const fetchUser = client.users.cache.get(message.author.id);
    const getUserName = fetchUser.username;
    const fetchGuild = client.guilds.cache.get(message.guild.id);
    const getGuildName = fetchGuild.name;
    const fetchChannel = client.channels.cache.get(message.channel.id);
    const getChannelname = fetchChannel.name;


    return getOwner.send(`Msg: ${message.content}\nAuthor: ${getUserName}\nChannel: ${getChannelname}\nGuild: ${getGuildName}`);
}