const runningClear3 = new Map();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  config: {
    name: "clear3",
    aliases: ["c3"],
    version: "1.1.0",
    author: "shtot",
    countDown: 3,
    role: 1,
    shortDescription: "Clear 3 existing nicknames every second",
    category: "group",

    guide: {
      en: "{pn}\n{pn} off"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    const action = args[0]?.toLowerCase();

    // ==============================
    // STOP
    // ==============================

    if (action === "off") {
      if (!runningClear3.has(threadID)) {
        return message.reply(
          "ℹ️ No clear process is running."
        );
      }

      runningClear3.set(threadID, false);

      return message.reply(
        "🛑 Nickname clearing stopped."
      );
    }

    // ==============================
    // CHECK RUNNING
    // ==============================

    if (runningClear3.has(threadID)) {
      return message.reply(
        "⚠️ A clear process is already running.\n" +
        "Use /clear3 off to stop it."
      );
    }

    runningClear3.set(threadID, true);

    try {
      // ==============================
      // GET GROUP INFO
      // ==============================

      const info = await api.getThreadInfo(threadID);

      const nicknames = info.nicknames || {};

      // ==============================
      // ONLY MEMBERS WITH NICKNAMES
      // ==============================

      const membersWithNicknames =
        info.participantIDs.filter(uid => {
          const nickname = nicknames[uid];

          return (
            typeof nickname === "string" &&
            nickname.trim().length > 0
          );
        });

      // ==============================
      // NOTHING TO CLEAR
      // ==============================

      if (membersWithNicknames.length === 0) {
        runningClear3.delete(threadID);

        return message.reply(
          "ℹ️ No nicknames found in this group."
        );
      }

      await message.reply(
        `🧹 Starting nickname clearing.\n\n` +
        `👥 Nicknames found: ${membersWithNicknames.length}\n` +
        `⏱️ Clearing 3 nicknames every second.`
      );

      // ==============================
      // CLEAR 3 NICKNAMES EVERY SECOND
      // ==============================

      for (
        let i = 0;
        i < membersWithNicknames.length;
        i += 3
      ) {

        // Check stop
        if (runningClear3.get(threadID) === false) {
          runningClear3.delete(threadID);

          return message.reply(
            "🛑 Nickname clearing stopped."
          );
        }

        // Take 3 MEMBERS WHO ACTUALLY HAVE NICKNAMES
        const batch =
          membersWithNicknames.slice(i, i + 3);

        await Promise.all(
          batch.map(async uid => {

            try {

              await api.changeNickname(
                "",
                threadID,
                uid
              );

              console.log(
                `[CLEAR3] Cleared nickname for ${uid}`
              );

            } catch (err) {

              console.log(
                `[CLEAR3] Failed for ${uid}:`,
                err.message
              );
            }
          })
        );

        // Wait 1 second
        if (
          i + 3 <
          membersWithNicknames.length
        ) {
          await sleep(1000);
        }
      }

      runningClear3.delete(threadID);

      return message.reply(
        `✅ Finished.\n` +
        `🧹 Cleared ${membersWithNicknames.length} nicknames.`
      );

    } catch (err) {

      runningClear3.delete(threadID);

      console.error(
        "[CLEAR3 ERROR]",
        err
      );

      return message.reply(
        "❌ An error occurred while clearing nicknames."
      );
    }
  }
};
