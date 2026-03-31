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

function criarPainel(guild) {
  const embed = new EmbedBuilder()
    .setColor("#57F287")
    .setTitle("Painel de Cargos")
    .setDescription("Escolha abaixo o cargo que deseja receber.")
    .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
    .setFooter({
      text: "ERA DOS GIGANTES",
      iconURL: guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL()
    });

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
    if (!channel) {
      console.log("Canal não encontrado.");
      return;
    }

    const mensagens = await channel.messages.fetch({ limit: 100 });

    const painelExistente = mensagens.find((msg) => {
      if (msg.author.id !== client.user.id) return false;
      if (!msg.components || msg.components.length === 0) return false;

      return msg.components.some((row) =>
        row.components.some((component) => component.customId === BUTTON_ID)
      );
    });

    const painel = criarPainel(channel.guild);

    if (painelExistente) {
      await painelExistente.edit(painel);
      console.log("Painel existente atualizado.");
    } else {
      await channel.send(painel);
      console.log("Novo painel enviado.");
    }
  } catch (error) {
    console.error("Erro ao enviar painel:", error);
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
    console.error("Erro ao alterar cargo:", error);
    await interaction.reply({
      content: "Não consegui alterar o cargo. Verifique as permissões do bot.",
      ephemeral: true
    });
  }
});

client.login(TOKEN);
