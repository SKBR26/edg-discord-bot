const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const TOKEN = process.env.TOKEN;

// IDs
const CHANNEL_ID = "1488567040615776326";
const ROLE_ID = "1488562034013638829";

// comando para enviar o painel
const COMMAND = "!painelninho";

client.once("ready", () => {
  console.log(`Bot online: ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.content !== COMMAND) return;

  const embed = new EmbedBuilder()
    .setTitle("🪺 Painel de Cargos")
    .setDescription("Clique no botão abaixo para pegar ou remover o cargo **Ninho**.")
    .setColor("Green");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("cargo_ninho")
      .setLabel("NINHO")
      .setEmoji("🪺")
      .setStyle(ButtonStyle.Success)
  );

  await message.channel.send({
    embeds: [embed],
    components: [row]
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== "cargo_ninho") return;

  const member = interaction.member;
  const hasRole = member.roles.cache.has(ROLE_ID);

  try {
    if (hasRole) {
      await member.roles.remove(ROLE_ID);
      await interaction.reply({
        content: "Cargo **Ninho** removido com sucesso.",
        ephemeral: true
      });
    } else {
      await member.roles.add(ROLE_ID);
      await interaction.reply({
        content: "Cargo **Ninho** adicionado com sucesso.",
        ephemeral: true
      });
    }
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "Não consegui alterar o cargo. Verifique as permissões do bot.",
      ephemeral: true
    });
  }
});

client.login(TOKEN);
