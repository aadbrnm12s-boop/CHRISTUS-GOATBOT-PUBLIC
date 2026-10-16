const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const TEMPLATE_URL = "https://imglink.cc/cdn/xjdifsoD0q.jpg";

module.exports = {
  config: {
    name: "sed",
    version: "1.0.0",
    author: "fadi",
    countDown: 5,
    role: 0,
    longDescription: "تركيب صور البروفايل على قالب أنمي",
    category: "love",
    guide: "{pn} بالرد على رسالة الشخص"
  },

  onStart: async function ({ message, event }) {
    let outputPath;

    try {
      // تحديد الشخص عن طريق الرد أو المنشن
      const targetID =
        event.messageReply?.senderID ||
        Object.keys(event.mentions || {})[0];

      if (!targetID) {
        return message.reply(
          "رد على رسالة الشخص واكتب sed باش تصاوب الصورة."
        );
      }

      const senderID = event.senderID;

      if (senderID === targetID) {
        return message.reply("خاصك ترد على رسالة شخص آخر.");
      }

      await message.reply("جاري تجهيز الصورة، انتظر قليلاً...");

      // تحميل القالب
      const templateResponse = await axios.get(TEMPLATE_URL, {
        responseType: "arraybuffer",
        timeout: 30000
      });

      const template = await loadImage(
        Buffer.from(templateResponse.data)
      );

      const canvas = createCanvas(
        template.width,
        template.height
      );

      const ctx = canvas.getContext("2d");
      ctx.drawImage(template, 0, 0);

      // تحميل صور البروفايل
      async function getAvatar(uid) {
        const response = await axios.get(
          `https://graph.facebook.com/${uid}/picture?type=large`,
          {
            responseType: "arraybuffer",
            timeout: 20000,
            maxRedirects: 5
          }
        );

        return loadImage(Buffer.from(response.data));
      }

      // تركيب صورة البروفايل بشكل دائري
      function drawAvatar(img, x, y, size) {
        ctx.save();

        ctx.beginPath();
        ctx.arc(
          x + size / 2,
          y + size / 2,
          size / 2,
          0,
          Math.PI * 2
        );
        ctx.closePath();
        ctx.clip();

        const scale = Math.max(
          size / img.width,
          size / img.height
        );

        const width = img.width * scale;
        const height = img.height * scale;

        ctx.drawImage(
          img,
          x + (size - width) / 2,
          y + (size - height) / 2,
          width,
          height
        );

        ctx.restore();
      }

      const [myAvatar, targetAvatar] = await Promise.all([
        getAvatar(senderID),
        getAvatar(targetID)
      ]);

      // إحداثيات تقريبية للقالب الأصلي
      const sx = template.width / 880;
      const sy = template.height / 1536;

      // بروفايل الشخص الموجود على اليسار
      drawAvatar(
        myAvatar,
        235 * sx,
        744 * sy,
        110 * sx
      );

      // بروفايل الشخص الموجود على اليمين
      drawAvatar(
        targetAvatar,
        520 * sx,
        435 * sy,
        130 * sx
      );

      outputPath = path.join(
        __dirname,
        `sed_${senderID}_${Date.now()}.png`
      );

      fs.writeFileSync(
        outputPath,
        canvas.toBuffer("image/png")
      );

      await message.reply({
        body: "تم تجهيز الصورة.",
        attachment: fs.createReadStream(outputPath)
      });

    } catch (error) {
      console.error("SED ERROR:", error.message || error);

      await message.reply(
        "وقع خطأ أثناء إنشاء الصورة. تأكد أن مكتبة canvas منصبة وأن رابط القالب وصور البروفايل قابلة للتحميل."
      );
    } finally {
      if (outputPath) {
        setTimeout(() => {
          try {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
          } catch (error) {}
        }, 15000);
      }
    }
  }
};
