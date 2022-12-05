
const Faceit = require('faceit-js')
require('dotenv').config()
const { Client, Intents, Constants, MessageEmbed} = require('discord.js');
const levels = require('./level_points.json')

const api = new Faceit(process.env.api_key)

const client = new Client(
    {intents: [Intents.FLAGS.DIRECT_MESSAGES, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.DIRECT_MESSAGES]}
);

function rankup_check(elo, level) {
    if (level === 1) {
        return levels["2"] - elo + 1
    }
    else if (level === 2) {
        return levels["3"] - elo + 1
    }
    else if (level === 3) {
        return levels["4"] - elo + 1
    }
    else if (level === 4) {
        return levels["5"] - elo + 1
    }
    else if (level === 5) {
        return levels["6"] - elo + 1
    }
    else if (level === 6) {
        return levels["7"] - elo + 1
    }
    else if (level === 7) {
        return levels["8"] - elo + 1

    }
    else if (level === 8) {
        return levels["9"] - elo + 1
    }
    else if (level === 9) {
        return levels["10"] - elo + 1
    }
    else if (level === 10) {
        return 0
    }
}

function lvl_to_image(level){
    if (level === 1) {
        return "<:1_:1049074421765247037>"
    }
    else if (level === 2) {
        return "<:2_:1049074388647026780>"
    }
    else if (level === 3) {
        return "<:3_:1049074387015450634>"
    }
    else if (level === 4) {
        return "<:4_:1049074385656483870>"
    }
    else if (level === 5) {
        return "<:5_:1049074384377225328>"
    }
    else if (level === 6) {
        return "<:6_:1049074381747396658>"
    }
    else if (level === 7) {
        return "<:7_:1049074383005700187>"
    }
    else if (level === 8) {
        return "<:8_:1049074380484911104>"
    }
    else if (level === 9) {
        return "<:9_:1049074378849128562>"
    }
    else if (level === 10) {
        return "<:10:1049074377389527090>"
    }
}
client.on('ready', () => {
    console.log('Bot is ready!')

    const commands = client.application?.commands

    commands?.create({
        name: 'faceit',
        description: 'Get faceit stats',
        options: [
            {
                name: 'player',
                description: 'Player name',
                type: Constants.ApplicationCommandOptionTypes.STRING
            }]
    })
})

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName, options } = interaction;
    if (commandName === 'faceit') {

        const player = options.getString('player')
        api.nickname(player).then((res) => {
            const id = res.player_id
            api.players(id, "stats", "csgo").then((res) => {
                let data = JSON.parse(JSON.stringify(res))
                let matches = data.lifetime.Matches
                let wins = data.lifetime.Wins
                let winrate = (wins / matches) * 100
                let recent = data.lifetime["Recent Results"]
                let KD = data.lifetime["Average K/D Ratio"]
                let total_hs = data.lifetime["Total Headshots %"]

                for (let i = 0; i < recent.length; i++) {
                    if (recent[i] === "1") {
                        recent[i] = "W"
                    } else{
                        recent[i] = "L"
                    }
                }

                api.players(id).then((res) => {
                    let data = JSON.parse(JSON.stringify(res))
                    let elo = data.games.csgo.faceit_elo
                    let level = data.games.csgo.skill_level
                    let rankup = rankup_check(elo, level)
                    let avatar = data.avatar

                    const embed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`${player}`)
                        .setURL(`https://www.faceit.com/en/players/${player}`)
                        .setAuthor('Faceit Stats', 'https://assets.faceit-cdn.net/hubs/avatar/88e4f75f-59c4-4f9d-9c66-61fa3847cb96_1554135063735.jpg', 'https://www.faceit.com/en')
                        .setThumbnail(`https://faceit.jake0001.com/${level}.png`)
                        .addFields(
                            { name: 'Level', value: level + lvl_to_image(level), inline: false },
                            { name: 'Elo', value: `${elo}`, inline: false },
                            { name: 'Elo Till Rankup', value: `${rankup}`, inline: false },
                            { name: 'Matches', value: matches, inline: false },
                            { name: 'Wins', value: wins, inline: false },
                            { name: 'Winrate', value: winrate.toFixed(2) + "%", inline: false },
                            { name: 'Recent', value: `${recent[0]}, ${recent[1]}, ${recent[2]}, ${recent[3]}, ${recent[4]} `, inline: false },
                            { name: 'KD', value: KD, inline: false },
                            { name: 'Total HS', value: total_hs, inline: false }
                        )
                        .setTimestamp()
                    interaction.reply({ embeds: [embed] })
                })




            }).catch((err) => {
                console.log(err)
                interaction.reply({ content: 'Player not found', ephemeral: true })
            })
        }).catch((err) => {
            console.log(err)
            interaction.reply({ content: 'Player not found', ephemeral: true })
        })


    }
})

console.log('Bot is starting...')

client.login(process.env.token)