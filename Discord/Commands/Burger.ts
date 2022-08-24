import { ChatInputCommandInteraction, Interaction } from "discord.js";

export async function BurgerCommandHandler(interaction: ChatInputCommandInteraction){
    var targetUser = interaction.options.getUser('target');
    await interaction.reply(`<@${interaction.user.id}> just burgered <@${targetUser.id}>`);
}