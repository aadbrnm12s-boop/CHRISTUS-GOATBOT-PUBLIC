const runningNick2 = new Map();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  config: {
    name: "nick2",
    aliases: ["n2"],
    version: "1.0.0",
    author: "shtot",
    countDown: 3,
    role: 1,
    shortDescription: "Change 2 nicknames every second",
    category: "group",

    guide: {
      en: "{pn} <nickname>\n{pn} off"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    const action = args[0]?.toLowerCase();

    // ==============================
    // STOP
    // ==============================

    if (action === "off") {
      if (!runningNick2.has(threadID)) {
        return message.reply(
          "ℹ️ No nickname process is running."
        );
      }

      runningNick2.set(threadID, false);

      return message.reply(
        "🛑 Nickname process stopped."
      );
    }

    // ==============================
    // CHECK NICKNAME
    // ==============================

    if (args.length === 0) {
      return message.reply(
        "❌ Usage:\n\n" +
        "/nick2 Shtot\n" +
        "/nick2 off\n\n" +
        "⏱️ Changes 2 nicknames every second."
      );
    }

    // ==============================
    // CHECK RUNNING
    // ==============================

    if (runningNick2.has(threadID)) {
      return message.reply(
        "⚠️ A nickname process is already running.\n" +
        "Use /nick2 off to stop it."
      );
    }

    const nickname = args.join(" ");

    runningNick2.set(threadID, true);

    try {
      // ==============================
      // GET MEMBERS
      // ==============================

      const info = await api.getThreadInfo(threadID);
      const members = info.participantIDs;

      if (!members || members.length === 0) {
        runningNick2.delete(threadID);

        return message.reply(
          "❌ No members found."
        );
      }

      await message.reply(
        `🚀 Starting nickname changer.\n\n` +
        `👥 Members: ${members.length}\n` +
        `✏️ Nickname: ${nickname}\n` +
        `⏱️ 2 nicknames every second`
      );

      // ==============================
      // CHANGE 2 EVERY SECOND
      // ==============================

      for (let i = 0; i < members.length; i += 2) {

        // Check stop
        if (runningNick2.get(threadID) === false) {
          runningNick2.delete(threadID);

          return message.reply(
            "🛑 Nickname process stopped."
          );
        }

        const batch = members.slice(i, i + 2);

        // Change exactly 2 members
        await Promise.all(
          batch.map(async uid => {
            try {
              await api.changeNickname(
                nickname,
                threadID,
                uid
              );

              console.log(
                `[NICK2] Changed nickname for ${uid}`
              );

            } catch (err) {
              console.log(
                `[NICK2] Failed for ${uid}:`,
                err.message
              );
            }
          })
        );

        // Wait 1 second
        if (i + 2 < members.length) {
          await sleep(1000);
        }
      }

      runningNick2.delete(threadID);

      return message.reply(
        "✅ Finished changing nicknames."
      );

    } catch (err) {

      runningNick2.delete(threadID);

      console.error(
        "[NICK2 ERROR]",
        err
      );

      return message.reply(
        "❌ An error occurred while changing nicknames."
      );
    }
  }
};
