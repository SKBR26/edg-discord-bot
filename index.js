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
const BUTTON_ID = "cargo_ninho";

function criarPainel() {
  const embed = new EmbedBuilder()
    .setTitle("🥚 Painel de Cargos")
    .setDescription("Clique no cargo desejado.")
    .setColor("Green");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(BUTTON_ID)
      .setLabel("NINHO")
      .setEmoji("🥚")
      .setStyle(ButtonStyle.Success)
  );

  return {
    embeds: [embed],
    components: [row]
  };
}

client.once("ready", async () => {
  console.log(`Bot online: ${client.user.tag}`);

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    const mensagens = await channel.messages.fetch({ limit: 20 });

    const mensagemPainel = mensagens.find((msg) => {
      if (msg.author.id !== client.user.id) return false;
      if (!msg.components?.length) return false;

      return msg.components.some((row) =>
        row.components.some((component) => component.customId === BUTTON_ID)
      );
    });

    const painel = criarPainel();

    if (mensagemPainel) {
      await mensagemPainel.edit(painel);
      console.log("Painel existente atualizado com sucesso.");
    } else {
      await channel.send(painel);
      console.log("Novo painel enviado com sucesso.");
    }
  } catch (error) {
    console.error("Erro ao enviar/atualizar painel:", error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== BUTTON_ID) return;

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
