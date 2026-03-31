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
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel]
});

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = "1488567040615776326";
const ROLE_ID = "1488562034013638829";

client.once("ready", async () => {
  console.log(`Bot online: ${client.user.tag}`);

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

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

    await channel.send({
      embeds: [embed],
      components: [row]
    });
  } catch (error) {
    console.error("Erro ao enviar painel:", error);
  }
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
