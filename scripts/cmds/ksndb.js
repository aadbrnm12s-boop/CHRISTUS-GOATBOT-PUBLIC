const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "globalGroupLock.json");

function loadData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify({}), "utf8");
    }

    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  config: {
    name: "slobalgroup",
    aliases: ["sname", "spic", "slock", "sunlock"],
    version: "2.0.0",
    author: "shtot",
    countDown: 10,
    role: 2,
    shortDescription: "تحكم في أسماء وصور جميع الكروبات",
    category: "box"
  },

  onStart: async function ({ api, event, args, message }) {
    const command = event.body
      .trim()
      .split(/\s+/)[0]
      .toLowerCase();

    const data = loadData();

    let threads;

    try {
      threads = await api.getThreadList(100, null, ["INBOX"]);
    } catch (err) {
      console.error(err);
      return message.reply("❌ ما قدرتش نجيب لائحة الكروبات.");
    }

    const groups = threads.filter(
      thread => thread.isGroup && thread.threadID
    );

    if (!groups.length) {
      return message.reply("❌ ما لقيتش حتى كروب.");
    }

    // ==========================
    // تغيير اسم جميع الكروبات
    // ==========================
    if (command === "sname") {
      const newName = args.join(" ").trim();

      if (!newName) {
        return message.reply(
          "❌ كتب الاسم الجديد.\n\nمثال:\nsname KNNN BOT"
        );
      }

      data.globalName = newName;
      saveData(data);

      await message.reply(
        `⏳ غادي نبدل اسم ${groups.length} كروب...`
      );

      let success = 0;
      let failed = 0;

      for (const group of groups) {
        try {
          await api.setTitle(newName, group.threadID);
          success++;
        } catch {
          failed++;
        }

        await sleep(1500);
      }

      return message.reply(
        `✅ تبديل الاسم سالى!\n\n` +
        `📌 الاسم: ${newName}\n` +
        `✅ نجح: ${success}\n` +
        `❌ فشل: ${failed}`
      );
    }

    // ==========================
    // تغيير صورة جميع الكروبات
    // ==========================
    if (command === "gpic") {
      if (!event.messageReply) {
        return message.reply(
          "❌ خاصك تدير Reply على صورة وتكتب spic."
        );
      }

      const attachments = event.messageReply.attachments || [];

      const image = attachments.find(
        att => att.type === "photo" && att.url
      );

      if (!image) {
        return message.reply(
          "❌ ما لقيتش صورة فـ الرسالة اللي رديتي عليها."
        );
      }

      data.globalImage = image.url;
      saveData(data);

      await message.reply(
        `⏳ غادي نبدل صورة ${groups.length} كروب...`
      );

      let success = 0;
      let failed = 0;

      for (const group of groups) {
        try {
          await api.changeGroupImage(
            image.url,
            group.threadID
          );

          success++;
        } catch {
          failed++;
        }

        await sleep(2000);
      }

      return message.reply(
        `✅ تبديل الصور سالى!\n\n` +
        `🖼️ نجح: ${success}\n` +
        `❌ فشل: ${failed}`
      );
    }

    // ==========================
    // قفل الاسم والصورة
    // ==========================
    if (command === "slock") {
      if (!data.globalName && !data.globalImage) {
        return message.reply(
          "❌ خاصك أولاً تحدد اسم بـ gname أو صورة بـ spic."
        );
      }

      data.locked = true;
      saveData(data);

      let restored = 0;

      for (const group of groups) {
        try {
          // تثبيت الاسم
          if (data.globalName) {
            await api.setTitle(
              data.globalName,
              group.threadID
            );
          }

          // تثبيت الصورة
          if (data.globalImage) {
            await api.changeGroupImage(
              data.globalImage,
              group.threadID
            );
          }

          restored++;
        } catch {}

        await sleep(1500);
      }

      return message.reply(
        `🔒 تم تفعيل القفل على جميع الكروبات!\n\n` +
        `📝 الاسم: ${data.globalName || "غير محدد"}\n` +
        `🖼️ الصورة: ${data.globalImage ? "محددة" : "غير محددة"}\n` +
        `📦 الكروبات: ${restored}`
      );
    }

    // ==========================
    // فتح القفل
    // ==========================
    if (command === "gunlock") {
      data.locked = false;
      saveData(data);

      return message.reply(
        "🔓 تم إيقاف القفل على جميع الكروبات."
      );
    }

    return message.reply(
      "📌 الأوامر:\n\n" +
      "sname <الاسم> — تغيير اسم جميع الكروبات\n" +
      "spic — تغيير صورة جميع الكروبات\n" +
      "slock — قفل الاسم والصورة\n" +
      "sunlock — فتح القفل"
    );
  },

  // =====================================
  // مراقبة تغييرات الكروبات
  // =====================================
  onEvent: async function ({ api, event }) {
    const data = loadData();

    if (!data.locked) return;

    const threadID = event.threadID;
    if (!threadID) return;

    try {
      // إذا تبدل اسم الكروب
      if (
        event.logMessageType === "log:thread-name" &&
        data.globalName
      ) {
        await api.setTitle(
          data.globalName,
          threadID
        );
      }

      // إذا تبدلات صورة الكروب
      if (
        event.logMessageType === "log:thread-image" &&
        data.globalImage
      ) {
        await api.changeGroupImage(
          data.globalImage,
          threadID
        );
      }
    } catch (err) {
      console.error(
        "Global group lock error:",
        err
      );
    }
  }
};
