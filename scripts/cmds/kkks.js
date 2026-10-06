const running = new Map();
const nicknameLocks = new Map();

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  config: {
    name: "nickset",
    aliases: ["nick"],
    version: "2.0.0",
    author: "shtot",
    countDown: 3,
    role: 1,
    shortDescription: "Manage group nicknames",
    category: "group",
    guide: {
      en: "{pn} <nickname>\n{pn} clear\n{pn} lock\n{pn} unlock\n{pn} off"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    const action = args[0]?.toLowerCase();

    // STOP
    if (action === "off") {
      running.set(threadID, false);
      return message.reply("🛑 Nickname process stopped.");
    }

    // UNLOCK
    if (action === "unlock") {
      nicknameLocks.delete(threadID);
      return message.reply("🔓 Nickname lock disabled.");
    }

    // LOCK
    if (action === "lock") {
      try {
        const info = await api.getThreadInfo(threadID);
        const saved = {};

        for (const uid of info.participantIDs) {
          try {
            saved[uid] = info.nicknames?.[uid] || "";
          } catch (e) {
            saved[uid] = "";
          }
        }

        nicknameLocks.set(threadID, saved);

        return message.reply(
          "🔒 Nickname lock enabled.\n" +
          "The bot will try to restore saved nicknames when they change."
        );
      } catch (err) {
        console.error(err);
        return message.reply("❌ Could not enable nickname lock.");
      }
    }

    // CLEAR OR SET
    const clear = action === "clear";

    if (!clear && args.length === 0) {
      return message.reply(
        "❌ Usage:\n\n" +
        "/nickset Shtot\n" +
        "/nickset clear\n" +
        "/nickset lock\n" +
        "/nickset unlock\n" +
        "/nickset off"
      );
    }

    if (running.get(threadID)) {
      return message.reply("⚠️ A nickname process is already running.");
    }

    running.set(threadID, true);

    try {
      const info = await api.getThreadInfo(threadID);
      const members = info.participantIDs;

      // Save current nicknames before changing them
      if (clear) {
        const saved = {};

        for (const uid of members) {
          saved[uid] = info.nicknames?.[uid] || "";
        }

        nicknameLocks.set(threadID, saved);
      }

      const newNickname = args.join(" ");

      await message.reply(
        clear
          ? `🧹 Clearing nicknames of ${members.length} members...`
          : `🚀 Changing nicknames of ${members.length} members...`
      );

      // 5 members per batch
      for (let i = 0; i < members.length; i += 5) {

        if (running.get(threadID) === false) {
          running.delete(threadID);
          return message.reply("🛑 Process stopped.");
        }

        const batch = members.slice(i, i + 5);

        await Promise.all(
          batch.map(async uid => {
            try {
              await api.changeNickname(
                clear ? "" : newNickname,
                threadID,
                uid
              );
            } catch (err) {
              console.log(`Failed for ${uid}: ${err.message}`);
            }
          })
        );

        if (i + 5 < members.length) {
          await sleep(500);
        }
      }

      running.delete(threadID);

      return message.reply(
        clear
          ? "✅ All nicknames cleared."
          : "✅ All nicknames changed."
      );

    } catch (err) {
      running.delete(threadID);
      console.error(err);
      return message.reply("❌ An error occurred.");
    }
  },

  // Watch nickname changes
  onEvent: async function ({ event, api }) {
    const threadID = event.threadID;

    if (!nicknameLocks.has(threadID)) {
      return;
    }

    const saved = nicknameLocks.get(threadID);

    /*
      When GoatBot receives a nickname-change event,
      restore the saved nickname.
    */
    if (event.logMessageType === "log:thread-name") {
      return;
    }

    if (
      event.logMessageType === "log:subscribe" ||
      event.logMessageType === "log:unsubscribe"
    ) {
      return;
    }

    // Refresh thread information and restore saved nicknames
    try {
      const info = await api.getThreadInfo(threadID);

      for (const uid of info.participantIDs) {
        if (!(uid in saved)) continue;

        const current = info.nicknames?.[uid] || "";
        const original = saved[uid] || "";

        if (current !== original) {
          try {
            await api.changeNickname(
              original,
              threadID,
              uid
            );
          } catch (err) {
            console.log(
              `Could not restore nickname for ${uid}:`,
              err.message
            );
          }
        }
      }
    } catch (err) {
      console.log("Nickname lock error:", err.message);
    }
  }
};
