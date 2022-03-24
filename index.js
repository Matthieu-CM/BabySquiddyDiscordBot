const { Client, Channel } = require('discord.js');
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES", "GUILD_MESSAGE_REACTIONS"], partials: ["CHANNEL", "MESSAGE", "REACTION"] });
const config = { configChannel: process.env.CONFIG_CHANNEL, postChannel: process.env.POST_CHANNEL, token: process.env.DISCORD_BOT_TOKEN, babySquiddyUID: process.env.BABYSQUIDDY_UID, authorizedAdmins: ["888820361972564068", "324180427516411905"] }
const prefix = "!";
let Post;
let rolesReaction = []
let messages = []

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

async function fetchReaction(reaction) {
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            return await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            // Return as `reaction.message.author` may be undefined/null
            return false;
        }
    }
    return reaction
}

async function getUserFromReaction(client, reaction, userId) {
    let guild = await client.guilds.fetch(reaction.message.guildId)
    return await guild.members.cache.get(userId)
}

client.on('messageCreate', async msg => {
    try {
        if (!msg.content.startsWith(prefix)) return;
        if (config.authorizedAdmins.includes(msg.author.id)) {
            if (msg.content === 'ping') {
                msg.reply('pong');
            }
            const commandBody = msg.content.slice(prefix.length);
            const args = commandBody.split(' ');
            const command = args.shift().toLowerCase();

            if (command === "newpost") {
                Post = args.join(" ")
            }

            if (command === "reactionadd") {
                rolesReaction.push({ name: args[0], role: args[1] })
                console.log(args)
            }

            if (command === "post") {
                try {
                    let data = await client.channels.cache.get(config.postChannel).send(Post)
                    rolesReaction.forEach((emoji) => {
                        data.react(emoji.name)
                    })
                    messages.push({
                        id: data.id,
                        rolesReaction
                    })
                } catch (err) {
                    console.log(err)
                }
                console.log(messages)
                Post = ""
                rolesReaction = []
            }

        }
    } catch (err) {
        console.log(err)
    }
});

client.on("messageReactionAdd", async (reaction, user) => {
    reaction = await fetchReaction(reaction)
    if (reaction === false) {
        return
    }

    if (reaction.message.author.id !== config.babySquiddyUID) {
        return
    }
    userToAddRole = await getUserFromReaction(client, reaction, user.id)

    let message = messages.filter(msg => msg.id === reaction.message.id)
    message[0].rolesReaction.forEach((userReaction) => {
        if (reaction.emoji.name === userReaction.name) {
            let roleIdToFind = userReaction.role.slice(0, -1).substring(3)
            let role = reaction.message.guild.roles.cache.find(role => role.id === roleIdToFind)
            userToAddRole.roles.add(role)
        }
    })
})


client.on("messageReactionRemove", async (reaction, user) => {
    reaction = await fetchReaction(reaction)
    if (reaction === false) {
        return
    }
    if (reaction.message.author.id !== config.babySquiddyUID) {
        return
    }
    userToAddRole = await getUserFromReaction(client, reaction, user.id)

    let message = messages.filter(msg => msg.id === reaction.message.id)
    message[0].rolesReaction.forEach((userReaction) => {
        if (reaction.emoji.name === userReaction.name) {
            let roleIdToFind = userReaction.role.slice(0, -1).substring(3)
            let role = reaction.message.guild.roles.cache.find(role => role.id === roleIdToFind)
            userToAddRole.roles.remove(role)
        }
    })
})

client.login(config.token);