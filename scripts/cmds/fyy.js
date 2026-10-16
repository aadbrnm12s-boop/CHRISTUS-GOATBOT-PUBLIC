const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const TEMPLATE_URL = "https://imglink.cc/cdn/Vo4p-NV_4C.jpg";

module.exports = {
  config: {
    name: "fyy",
    version: "1.0.0",
    author: "fadi",
    countDown: 5,
    role: 0,
    longDescription: "تركيب صور البروفايل على قالب أنمي",
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
          "رد على رسالة الشخص واكتب fyy، أو منشنه."
        );
      }

      const senderID = event.senderID;

      if (senderID === targetID) {
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
          throw new Error(
            "رابط صورة البروفايل غير متوفر للحساب: " + uid
          );
        }

        const response = await axios.get(avatarURL, {
          responseType: "arraybuffer",
          timeout: 30000,
          maxRedirects: 5,
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        });

        return loadImage(Buffer.from(response.data));
      }

      const [templateResponse, myAvatar, targetAvatar] =
        await Promise.all([
          axios.get(TEMPLATE_URL, {
            responseType: "arraybuffer",
            timeout: 30000
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

      function drawAvatar(img, centerX, centerY, size) {
        ctx.save();

        // إطار رقيق حول البروفايل
        ctx.beginPath();
        ctx.arc(
          centerX,
          centerY,
          size / 2 + 3,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "#777777";
        ctx.fill();

        // قص الصورة بشكل دائري
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

        const width = img.width * scale;
        const height = img.height * scale;

        ctx.drawImage(
          img,
          centerX - width / 2,
          centerY - height / 2,
          width,
          height
        );

        ctx.restore();
      }

      // أبعاد القالب المرجعية: 1461 × 1048
      const sx = template.width / 1461;
      const sy = template.height / 1048;

      // بروفايل منفذ الأمر في مكان «أنا»
      drawAvatar(
        myAvatar,
        650 * sx,
        155 * sy,
        175 * sx
      );

      // بروفايل الشخص المردود عليه فوق رأس الشخصية اليمنى
      drawAvatar(
        targetAvatar,
        1270 * sx,
        175 * sy,
        175 * sx
      );

      outputPath = path.join(
        __dirname,
        `fyy_${senderID}_${Date.now()}.png`
      );

      fs.writeFileSync(
        outputPath,
        canvas.toBuffer("image/png")
      );

      await message.reply({
        body: "ها هي الصورة ديالكم.",
        attachment: fs.createReadStream(outputPath)
      });

    } catch (err) {
      console.error("FYY ERROR:", err.stack || err);

      await message.reply(
        "تعذر إنشاء الصورة. تأكد من رابط القالب وإمكانية جلب صور البروفايل."
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
