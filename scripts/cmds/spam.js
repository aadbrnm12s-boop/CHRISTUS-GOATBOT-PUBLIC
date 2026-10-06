"use strict";

const tasks = new Map();

module.exports = {
  config: {
    name: "spam",
    aliases: [],
    version: "1.0.0",
    author: "shtot",
    countDown: 2,
    role: 0,
    shortDescription: "تكرار رسالة كل 15 ثانية",
    category: "fun"
  },

  onStart: async function ({ api, event, args, message }) {
    const threadID = event.threadID;

    // إيقاف
    if (
      args[0] &&
      ["stop", "وقف", "توقيف"].includes(
        String(args[0]).toLowerCase()
      )
    ) {
      const task = tasks.get(threadID);

      if (!task) {
        return message.reply("❌ ماكاين حتى Spam خدام.");
      }

      task.stop = true;

      if (task.timer) {
        clearTimeout(task.timer);
      }

      tasks.delete(threadID);

      return message.reply("🛑 تم توقيف Spam.");
    }

    if (!args.length) {
      return message.reply(
        "❌ كتب الرسالة.\n\nمثال:\n-spam سلام\n\nللإيقاف:\n-spam stop"
      );
    }

    if (tasks.has(threadID)) {
      return message.reply(
        "⚠️ كاين Spam خدام دابا.\n\nاستعمل:\n-spam stop"
      );
    }

    const text = args.join(" ").trim();

    const task = {
      stop: false,
      timer: null,
      busy: false
    };

    tasks.set(threadID, task);

    await message.reply(
      "🚀 بدا Spam\n\n" +
      "📝 الرسالة: " + text + "\n" +
      "⏱️ كل 15 ثانية\n\n" +
      "🛑 للإيقاف: -spam stop"
    );

    async function sendLoop() {
      if (task.stop) return;

      if (!task.busy) {
        task.busy = true;

        try {
          await api.sendMessage(text, threadID);
        } catch (error) {
          // ما نوقفوش السبام بسبب خطأ واحد
        }

        task.busy = false;
      }

      if (!task.stop) {
        task.timer = setTimeout(sendLoop, 15000);
      }
    }

    task.timer = setTimeout(sendLoop, 15000);
  }
};
