const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "clear",
  description: "Clears the specified number of messages in the channel",
  category: "MODERATION",
  userPermissions: ["KickMembers"],
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "amount",
        description: "the number of messages to clear or * for all",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async interactionRun(interaction) {
    const moderatorRoleID = process.env.MODERATOR_ROLE_ID;

    if (!interaction.member.roles.cache.has(moderatorRoleID)) {
      return interaction.reply('You do not have permission to use this command.');
    }
    const amount = interaction.options.getString("amount");

    if (amount === "*") {
      // Delete all messages
      let deleted = 0;
      let batch;
      do {
        batch = await interaction.channel.bulkDelete(100, true).catch(err => {
          if (err.message.includes("You can only bulk delete messages that are under 14 days old.")) {
            interaction.reply("I cannot delete messages that are older than 14 days.");
          } else {
            interaction.reply("There was an error trying to prune messages in this channel!");
          }
        });
        if (batch) deleted += batch.size;
      } while (batch && batch.size === 100);
      if (deleted) interaction.reply(`Successfully deleted ${deleted} messages.`);
    } else {
      // Delete specified amount of messages
      const count = parseInt(amount);
      if (isNaN(count) || count < 1 || count > 100) {
        interaction.reply("You need to input a number between 1 and 100.");
      } else {
        await interaction.channel.bulkDelete(count, true).catch(err => {
          if (err.message.includes("You can only bulk delete messages that are under 14 days old.")) {
            interaction.reply("I cannot delete messages that are older than 14 days.");
          } else {
            interaction.reply("There was an error trying to prune messages in this channel!");
          }
        });
        if (!isNaN(count)) interaction.reply(`Successfully deleted ${count} messages.`);
      }
    }
  },
};