const Discord = require("discord.js");

module.exports = {
    name: 'kick',
    desc: 'Kicks the mentioned user from the server.',
    dir: 'moderation',
    args: true,
    permissions: 'KICK_MEMBERS',
    usage: '<mention> {reason}',
    guildOnly: true,
    async execute (message, args) {
        const member = message.mentions.users.first();args.shift();
        const person = message.guild.members.resolve(member);
        if(!person) return message.channel.send(`You need to mention someone!`);
        if(message.member.roles.highest.compareTo(person.roles.highest))return message.channel.send(`Can't kick this person, they have higher role!`);
        if(person.id === message.author.id) return message.channel.send(`You can't kick yourself!`);
        const reason = args.join(' ');
        const commandsEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Kicking')
            .setDescription(`You are about to kick <@${person.id}>.\nReason: \`${reason}\`\nRespond with ✅ to kick this person`);
        
        message.channel.send(commandsEmbed)
            .then(msg => {
                msg.react('✅').then(() => msg.react('❎'));
                const filter = (reaction, user) => {
                    return ['✅', '❎'].includes(reaction.emoji.name) && user.id === message.author.id;
                };
                
                msg.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                    .then(collected => {
                        const reaction = collected.first();
                
                        if (reaction.emoji.name === '✅') {
                            try{
                                person.kick({ reason: reason });
                                message.reply(`<@${person.id}> has been kicked!`);
                                return msg.delete({ timeout: 2000 });
                            }catch(e){
                                return message.channel.send(`Can't kick this person, they have higher role!`).then(() => msg.delete({ timeout: 2000 }));
                            }
                        } else {
                            return msg.delete({ timeout: 2000 });
                        }
                    })
            })
    }
}