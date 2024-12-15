require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const items = require('../../data/items')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bau')
		.setDescription('Cria um registro no baú')
		.addStringOption(option => 
			option.setName('type')
				.setDescription('Escolha o tipo do baú')
				.setRequired(true)
				.addChoices(
					{ name: 'Gerência', value: 'gerencia' },
					{ name: 'Membros', value: 'membros' }
				)
		)
		.addStringOption(option => 
			option.setName('action')
				.setDescription('Qual ação?')
				.setRequired(true)
				.addChoices(
						{ name: 'Adição', value: 'add' },
						{ name: 'Remoção', value: 'remove' }
				)
		)
		.addStringOption(option =>
			option.setName('item')
			.setDescription('Escolha o item')
			.setRequired(true)
			.setAutocomplete(true)
		)
		.addIntegerOption(option => 
			option.setName('quantity')
				.setDescription('Quantidade')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(100000000)
		),
	async execute(interaction) {
		// Define canal único para uso do comando
		if (interaction.channel.id !== process.env.BOT_CHANNEL_ID) {
			return await interaction.reply({
				content: 'Erro: Esse comando não pode ser usado neste canal',
				ephemeral: true
			});
		}

		const selectedType = interaction.options.getString('type');
		const selectedAction = interaction.options.getString('action');
		const selectedItem = interaction.options.getString('item');
		const quantity = interaction.options.getInteger('quantity');

		const targetChannelId = selectedType === 'gerencia' ? process.env.LEADERS_CHEST_ID : process.env.MEMBERS_CHEST_ID;
		const targetChannel = interaction.guild.channels.cache.get(targetChannelId);

		const actionStyle = selectedAction === 'add' ? {color: 0x00AE86, label: 'Adicionou'} : {color: 0xE14444, label: 'Removeu'};

		// Verifica se o item existe, se não, manda uma mensagem ephemeral (só para o usuário)
		if (!items.includes(selectedItem)) {
			return await interaction.reply({
				content: 'Erro: Escolha um item válido ou chame o suporte',
				ephemeral: true
			});
		}

		const embed = new EmbedBuilder()
			.setColor(actionStyle.color)
			.setTitle(`${interaction.user.username} - **${actionStyle.label}** um item do baú`)
			.addFields(
				{ name: 'Item', value: `**${selectedItem}**`, inline: true },
				{ name: 'Quantidade', value: `**${quantity}**`, inline: true }
			)
			.setTimestamp()
			.setFooter({ text: 'Registro baú', iconURL: interaction.user.avatarURL() });

		await targetChannel.send({ embeds: [embed] });

		await interaction.reply({
			content: `🧞‍♂️`,
			ephemeral: true
		});
	},

	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		const filteredItems = items.filter(item => item.toLowerCase().includes(focusedValue.toLowerCase()));
		const choices = filteredItems.slice(0, 5).map(item => ({
			name: item,
			value: item
		}));

		await interaction.respond(choices);
	}
};