const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const TEMPLATE_URL = "https://imglink.cc/cdn/xjdifsoD0q.jpg";

module.exports = {
  config: {
    name: "hed",
    version: "1.2.0",
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
          "رد على رسالة الشخص واكتب hed، أو منشنه."
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
                new Error("تعذر جلب معلومات المستخدم: " + uid)
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
            "لم يتم العثور على رابط صورة البروفايل للحساب " + uid
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

      const [myAvatar, targetAvatar] = await Promise.all([
        getAvatar(senderID),
        getAvatar(targetID)
      ]);

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

      const sx = template.width / 880;
      const sy = template.height / 1536;

      // صورة المرسل على الشخصية اليسرى
      drawAvatar(
        myAvatar,
        235 * sx,
        744 * sy,
        110 * sx
      );

      // صورة الشخص الآخر على الشخصية اليمنى
      drawAvatar(
        targetAvatar,
        520 * sx,
        435 * sy,
        130 * sx
      );

      outputPath = path.join(
        __dirname,
        `hed_${senderID}_${Date.now()}.png`
      );

      fs.writeFileSync(
        outputPath,
        canvas.toBuffer("image/png")
      );

      await message.reply({
        body: "تم تجهيز الصورة.",
        attachment: fs.createReadStream(outputPath)
      });

    } catch (err) {
      console.error("HED ERROR:", err.stack || err);

      await message.reply(
        "تعذر جلب صور البروفايل أو تركيب الصورة. راجع سجل أخطاء البوت."
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
