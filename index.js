const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const TOKEN = const TOKEN = "COLOQUE_SEU_TOKEN_AQUI";

client.once("ready", () => {
  console.log(`Bot online: ${client.user.tag}`);
});

client.login(TOKEN);