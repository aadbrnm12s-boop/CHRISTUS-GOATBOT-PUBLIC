
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const TEMPLATE_URL =
  "https://i.postimg.cc/DwRHgcmG/37e1c4fc0152e47ae125a481d33596e1.jpg";

module.exports = {
  config: {
    name: "kiss2",
    version: "1.0.2",
    author: "fadi",
    countDown: 5,
    role: 0,
    longDescription: "تركيب بروفايلات على صورة قبلة أنمي",
    category: "love",
    guide: "{pn} بالرد على رسالة الشخص أو بالمنشن"
  },

  onStart: async function ({ message, event, api }) {
    let outputPath;

    try {
      const mentions = Object.keys(event.mentions || {});
      const targetID =
        event.messageReply?.senderID || mentions[0];

      if (!targetID) {
        return message.reply(
          "رد على رسالة الشخص واكتب kiss2، أو منشنه."
        );
      }

      const senderID = event.senderID;

      if (String(senderID) === String(targetID)) {
        return message.reply("اختار شخصاً آخر.");
      }

      await message.reply("جاري تجهيز الصورة، انتظر قليلاً...");

      function getUserInfo(uid) {
        return new Promise((resolve, reject) => {
          api.getUserInfo([uid], (err, info) => {
            if (err) return reject(err);

            const user = info && info[uid];

            if (!user) {
              return reject(
                new Error("تعذر جلب معلومات الحساب: " + uid)
              );
            }

            resolve(user);
          });
        });
      }

      async function getAvatar(uid) {
        const user = await getUserInfo(uid);

        const avatarURL =
          user.thumbSrc ||
          user.profilePic ||
          user.picture ||
          user.photoUrl;

        if (!avatarURL) {
          throw new Error("رابط البروفايل غير متوفر: " + uid);
        }

        const response = await axios.get(avatarURL, {
          responseType: "arraybuffer",
          timeout: 30000,
          headers: { "User-Agent": "Mozilla/5.0" }
        });

        return loadImage(Buffer.from(response.data));
      }

      const [templateResponse, myAvatar, targetAvatar] =
        await Promise.all([
          axios.get(TEMPLATE_URL, {
            responseType: "arraybuffer",
            timeout: 30000,
            headers: { "User-Agent": "Mozilla/5.0" }
          }),
          getAvatar(senderID),
          getAvatar(targetID)
        ]);

      const template = await loadImage(
        Buffer.from(templateResponse.data)
      );

      const canvas = createCanvas(
        template.width,
        template.height
      );

      const ctx = canvas.getContext("2d");
      ctx.drawImage(template, 0, 0);

      function drawAvatar(img, centerX, centerY, size, color) {
        ctx.save();

        // إطار دائري متوهج
        ctx.beginPath();
        ctx.arc(
          centerX,
          centerY,
          size / 2 + 4,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        // قص البروفايل داخل دائرة
        ctx.beginPath();
        ctx.arc(
          centerX,
          centerY,
          size / 2,
          0,
          Math.PI * 2
        );
        ctx.clip();

        const scale = Math.max(
          size / img.width,
          size / img.height
        );

        const w = img.width * scale;
        const h = img.height * scale;

        ctx.drawImage(
          img,
          centerX - w / 2,
          centerY - h / 2,
          w,
          h
        );

        ctx.restore();

        // خط خارجي رقيق
        ctx.save();
        ctx.beginPath();
        ctx.arc(
          centerX,
          centerY,
          size / 2 + 1,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();
      }

      // الإحداثيات محسوبة نسبياً حسب القالب
      const sx = template.width / 1536;
      const sy = template.height / 1536;

      // منفذ الأمر: بروفايله فوق الشاب
      drawAvatar(
        myAvatar,
        535 * sx,
        265 * sy,
        395 * sx,
        "#278BFF"
      );

      // الشخص المردود عليه: بروفايله فوق الفتاة
      drawAvatar(
        targetAvatar,
        1120 * sx,
        465 * sy,
        350 * sx,
        "#E84DFF"
      );

      outputPath = path.join(
        __dirname,
        `kiss2_${senderID}_${Date.now()}.png`
      );

      fs.writeFileSync(
        outputPath,
        canvas.toBuffer("image/png")
      );

      await message.reply({
        body: "ها هي صورة القبلة ديالكم ❤️",
        attachment: fs.createReadStream(outputPath)
      });

    } catch (err) {
      console.error("KISS2 ERROR:", err.stack || err);

      await message.reply(
        "تعذر إنشاء الصورة. تأكد من رابط القالب وإمكانية جلب صور البروفايلات."
      );
    } finally {
      if (outputPath) {
        setTimeout(() => {
          try {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
          } catch (e) {}
        }, 15000);
      }
    }
  }
};
