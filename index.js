const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Events
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ],
  partials: [Partials.Channel]
});

/*
|--------------------------------------------------------------------------
| CONFIGURAÇÕES
|--------------------------------------------------------------------------
*/
const TOKEN = process.env.TOKEN;

// ID do canal onde o painel será enviado
const CHANNEL_ID = "1488567040615776326";

// ID do cargo que será adicionado/removido
const ROLE_ID = "1488562034013638829";

// ID interno do botão
const BUTTON_ID = "cargo_ninho";

/*
|--------------------------------------------------------------------------
| FUNÇÃO: CRIAR PAINEL
|--------------------------------------------------------------------------
*/
function criarPainel(guild) {
  const embed = new EmbedBuilder()
    .setColor(0x57f287)
    .setTitle("📋 Painel de Cargos")
    .setDescription(
      [
        "Selecione abaixo o cargo disponível.",
        "",
        "🥚 **Ninho**",
        "> Clique no botão para **receber** ou **remover** esse cargo.",
        "",
        "Use o painel sempre que quiser alterar sua função."
      ].join("\n")
    )
    .setThumbnail(
      guild.iconURL({ dynamic: true, size: 256 }) ||
      client.user.displayAvatarURL()
    )
    .setFooter({
      text: "ERA DOS GIGANTES"
    })
    .setTimestamp();

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(BUTTON_ID)
      .setLabel("Pegar / Remover Ninho")
      .setEmoji("🥚")
      .setStyle(ButtonStyle.Success)
  );

  return {
    embeds: [embed],
    components: [row]
  };
}

/*
|--------------------------------------------------------------------------
| FUNÇÃO: ENVIAR OU ATUALIZAR O PAINEL
|--------------------------------------------------------------------------
*/
async function enviarOuAtualizarPainel() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel) {
      console.log("❌ Canal não encontrado.");
      return;
    }

    if (channel.type !== ChannelType.GuildText) {
      console.log("❌ O canal informado não é um canal de texto.");
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
      console.log("✅ Painel existente atualizado.");
    } else {
      await channel.send(painel);
      console.log("✅ Novo painel enviado.");
    }
  } catch (error) {
    console.error("❌ Erro ao enviar/atualizar painel:", error);
  }
}

/*
|--------------------------------------------------------------------------
| EVENTO: BOT PRONTO
|--------------------------------------------------------------------------
*/
client.once(Events.ClientReady, async () => {
  console.log(`✅ Bot online: ${client.user.tag}`);
  await enviarOuAtualizarPainel();
});

/*
|--------------------------------------------------------------------------
| EVENTO: INTERAÇÃO COM BOTÃO
|--------------------------------------------------------------------------
*/
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  if (interaction.customId !== BUTTON_ID) return;

  try {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({
        content: "❌ Este botão só pode ser usado dentro de um servidor.",
        ephemeral: true
      });
      return;
    }

    const member = await guild.members.fetch(interaction.user.id);
    const role = await guild.roles.fetch(ROLE_ID);

    if (!role) {
      await interaction.reply({
        content: "❌ O cargo configurado não foi encontrado.",
        ephemeral: true
      });
      return;
    }

    const botMember = await guild.members.fetchMe();

    // Verifica se o bot tem permissão de gerenciar cargos
    if (!botMember.permissions.has("ManageRoles")) {
      await interaction.reply({
        content: "❌ O bot não tem permissão para gerenciar cargos.",
        ephemeral: true
      });
      return;
    }

    // Verifica se o cargo do bot está acima do cargo que ele vai gerenciar
    if (role.position >= botMember.roles.highest.position) {
      await interaction.reply({
        content:
          "❌ Não consigo alterar esse cargo porque ele está acima do meu cargo na hierarquia.",
        ephemeral: true
      });
      return;
    }

    const hasRole = member.roles.cache.has(ROLE_ID);

    if (hasRole) {
      await member.roles.remove(role);

      await interaction.reply({
        content: "🗑️ O cargo **Ninho** foi removido com sucesso.",
        ephemeral: true
      });
    } else {
      await member.roles.add(role);

      await interaction.reply({
        content: "✨ Você recebeu o cargo **Ninho** com sucesso.",
        ephemeral: true
      });
    }
  } catch (error) {
    console.error("❌ Erro ao alterar cargo:", error);

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content:
            "❌ Não consegui alterar o cargo. Verifique as permissões e a hierarquia do bot.",
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content:
            "❌ Não consegui alterar o cargo. Verifique as permissões e a hierarquia do bot.",
          ephemeral: true
        });
      }
    } catch (err) {
      console.error("❌ Erro ao responder interação:", err);
    }
  }
});

/*
|--------------------------------------------------------------------------
| LOGIN
|--------------------------------------------------------------------------
*/
client.login(TOKEN);
