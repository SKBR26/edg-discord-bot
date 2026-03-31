const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = "1488567040615776326";
const ROLE_ID = "1488562034013638829";
const BUTTON_ID = "cargo_ninho";

function criarPainel(guild) {
  const embed = new EmbedBuilder()
    .setColor(0x1f8b4c)
    .setAuthor({
      name: "Sistema de Cargos",
      iconURL: guild.iconURL({ dynamic: true }) || client.user.displayAvatarURL()
    })
    .setTitle("Painel de Seleção")
    .setDescription(
      [
        "Gerencie seu acesso utilizando o botão abaixo.",
        "",
        "**Cargo disponível**",
        "`NINHO`",
        "",
        "Ao clicar, o cargo será adicionado ou removido automaticamente."
      ].join("\n")
    )
    .setFooter({
      text: "ERA DOS GIGANTES"
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(BUTTON_ID)
      .setLabel("Gerenciar cargo")
      .setEmoji("🥚")
      .setStyle(ButtonStyle.Success)
  );

  return {
    embeds: [embed],
    components: [row]
  };
}

client.once(Events.ClientReady, async () => {
  console.log(`Bot online: ${client.user.tag}`);

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    const mensagens = await channel.messages.fetch({ limit: 50 });

    const painelExistente = mensagens.find((msg) => {
      if (msg.author.id !== client.user.id) return false;
      if (!msg.components?.length) return false;

      return msg.components.some((row) =>
        row.components.some((component) => component.customId === BUTTON_ID)
      );
    });

    const painel = criarPainel(channel.guild);

    if (painelExistente) {
      await painelExistente.edit(painel);
      console.log("Painel atualizado.");
    } else {
      await channel.send(painel);
      console.log("Painel enviado.");
    }
  } catch (error) {
    console.error("Erro ao enviar painel:", error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== BUTTON_ID) return;

  try {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const role = await interaction.guild.roles.fetch(ROLE_ID);

    if (!role) {
      return await interaction.reply({
        content: "Não foi possível localizar o cargo configurado.",
        ephemeral: true
      });
    }

    if (member.roles.cache.has(ROLE_ID)) {
      await member.roles.remove(role);

      return await interaction.reply({
        content: "O cargo **Ninho** foi removido com sucesso.",
        ephemeral: true
      });
    }

    await member.roles.add(role);

    return await interaction.reply({
      content: "O cargo **Ninho** foi adicionado com sucesso.",
      ephemeral: true
    });
  } catch (error) {
    console.error("Erro ao alterar cargo:", error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "Não foi possível alterar o cargo no momento.",
        ephemeral: true
      });
    } else {
      await interaction.reply({
        content: "Não foi possível alterar o cargo no momento.",
        ephemeral: true
      });
    }
  }
});

client.login(TOKEN);
