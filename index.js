const { Client, Channel } = require('discord.js');
const client = new Client({ intents: ["GUILDS", "GUILD_MESSAGES", "DIRECT_MESSAGES", "GUILD_MESSAGE_REACTIONS"], partials: ["CHANNEL", "MESSAGE", "REACTION"] });
const config = { configChannel : "955798402824818729", postChannel: "956529341217534004", token: "OTU1Nzk3NzI1MDY3MjM1MzI5.Yjm5_w.KzZhgnYAYDVtJFPHWACSfFfpCao", babySquiddyUID: "955797725067235329", authorizedAdmins: ["888820361972564068", "324180427516411905"] }
const prefix = "!";
let postId;
let Post;
let rolesReaction = []

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('messageCreate', async msg => {
    try {
        if (msg.content === 'ping') {
            msg.reply('pong');
        }
        if (!msg.content.startsWith(prefix)) return;
        const commandBody = msg.content.slice(prefix.length);
        const args = commandBody.split(' ');
        const command = args.shift().toLowerCase();
        // console.log(msg)
        console.log(command)

        if (command === "newpost") {
            Post = args.join(" ")
            postId = new Date().getTime()
        }

        if (command === "reactionadd") {
            rolesReaction.push({emoji : args[0], role : args[1]})
            console.log(args)
        }

        if (command === "post") {
            let data = await client.channels.cache.get(config.postChannel).send(Post)
            rolesReaction.forEach((emoji) => {
                data.react(emoji.emoji)
            })
            console.log(data)
        }

    } catch (err) {
        console.log(err)
        // client.channels.cache.get(config.logChannel).send("<@324180427516411905> je suis dans le catch ALED on a failli crash");
    }
});

client.on("messageReactionAdd", async (reaction, user) => {
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    if (reaction.message.author.id !== config.babySquiddyUID) {
        return
    }
    let guild = await client.guilds.fetch(reaction.message.guildId)
    let userToAddRole = await guild.members.cache.get(user.id)
    if (reaction.emoji.name === "karimf5Well") {
        let role = reaction.message.guild.roles.cache.find(role => role.name === "TEST REACTION")
        userToAddRole.roles.add(role)
        console.log(`${userToAddRole.user.username} a eu le role => TEST REACTION`);
    }
})


client.on("messageReactionRemove", async (reaction, user) => {
    console.log("REMOVE REACTION")
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }

    if (reaction.message.author.id !== config.babySquiddyUID) {
        return
    }
    let guild = await client.guilds.fetch(reaction.message.guildId)
    let userToAddRole = await guild.members.cache.get(user.id)
    if (reaction.emoji.name === "karimf5Well") {
        let role = reaction.message.guild.roles.cache.find(role => role.name === "TEST REACTION")
        userToAddRole.roles.remove(role)
    }
    console.log(`${reaction.message.author.username}'s message`);

})

client.login(config.token);