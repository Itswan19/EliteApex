import { SlashCommandBuilder, MessageFlags, ChannelType, PermissionFlagsBits } from 'discord.js';
import { logger } from '../../utils/logger.js';
import { handleInteractionError } from '../../utils/errorHandler.js';

export default {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot send a message')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('The message you want the bot to say')
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Where the bot should send the message')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false)
        ),

    async execute(interaction, config, client) {
        try {
            const message = interaction.options.getString('message');
            const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

            if (!targetChannel || !targetChannel.isTextBased()) {
                return await interaction.reply({
                    content: 'I cannot send messages in that channel.',
                    flags: MessageFlags.Ephemeral
                });
            }

            await targetChannel.send({
                content: message,
                allowedMentions: {
                    parse: []
                }
            });

            await interaction.reply({
                content: `Message sent in ${targetChannel}.`,
                flags: MessageFlags.Ephemeral
            });

        } catch (error) {
            logger.error('Say command execution failed', {
                error: error.message,
                stack: error.stack,
                userId: interaction.user.id,
                guildId: interaction.guildId,
                commandName: 'say'
            });

            await handleInteractionError(interaction, error, {
                commandName: 'say',
                source: 'say_command'
            });
        }
    }
};
