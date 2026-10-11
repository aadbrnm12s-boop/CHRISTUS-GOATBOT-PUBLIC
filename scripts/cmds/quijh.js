const activeGames = new Map();
const scores = new Map();

const questions = [
  // =========================
  // حط هنا questions ديالك كاملة
  // =========================

  { q: "ما هي عاصمة المغرب؟", a: ["الرباط", "rabat"] },
  { q: "ما هو أكبر كوكب في المجموعة الشمسية؟", a: ["المشتري", "jupiter"] },
  { q: "كم عدد أيام الأسبوع؟", a: ["7", "سبعة"] },
  { q: "ما هو الكوكب المعروف بالكوكب الأحمر؟", a: ["المريخ", "mars"] },
  { q: "ما هي عاصمة فرنسا؟", a: ["باريس", "paris"] },
  { q: "كم عدد قارات العالم؟", a: ["7", "سبعة"] },
  { q: "ما هو أكبر محيط في العالم؟", a: ["المحيط الهادئ", "الهادئ", "pacific"] },
  { q: "ما هي عاصمة مصر؟", a: ["القاهرة", "cairo"] },
  { q: "كم عدد أشهر السنة؟", a: ["12", "اثنا عشر", "اثني عشر"] },
  { q: "ما هو الحيوان الذي يسمى ملك الغابة؟", a: ["الأسد", "اسد", "lion"] },

  { q: "ما هي عاصمة إسبانيا؟", a: ["مدريد", "madrid"] },
  { q: "ما هو أسرع حيوان بري؟", a: ["الفهد", "الشيتا", "cheetah"] },
  { q: "كم عدد أضلاع المثلث؟", a: ["3", "ثلاثة"] },
  { q: "ما هو أكبر حيوان على الأرض؟", a: ["الحوت الأزرق", "الحوت الازرق", "blue whale"] },
  { q: "ما هي عاصمة إيطاليا؟", a: ["روما", "rome"] },
  { q: "ما هو الغاز الذي نتنفسه؟", a: ["الأكسجين", "اكسجين", "oxygen"] },
  { q: "كم عدد حروف اللغة العربية؟", a: ["28", "ثمانية وعشرون"] },
  { q: "ما هو أقرب كوكب إلى الشمس؟", a: ["عطارد", "mercury"] },
  { q: "ما هي عاصمة اليابان؟", a: ["طوكيو", "tokyo"] },
  { q: "ما هو الحيوان المعروف بسفينة الصحراء؟", a: ["الجمل", "camel"] },

  { q: "ما هي عاصمة السعودية؟", a: ["الرياض", "riyadh"] },
  { q: "كم عدد ألوان قوس قزح؟", a: ["7", "سبعة"] },
  { q: "ما هو أكبر بلد في العالم من حيث المساحة؟", a: ["روسيا", "russia"] },
  { q: "ما هي عاصمة ألمانيا؟", a: ["برلين", "berlin"] },
  { q: "كم عدد أرجل العنكبوت؟", a: ["8", "ثمانية"] },
  { q: "ما هو المعدن الذي رمزه Au؟", a: ["الذهب", "gold"] },
  { q: "ما هي عاصمة تركيا؟", a: ["أنقرة", "انقرة", "ankara"] },
  { q: "ما هو أكبر عضو في جسم الإنسان؟", a: ["الجلد", "skin"] },
  { q: "ما هو الكوكب الذي نعيش عليه؟", a: ["الأرض", "ارض", "earth"] },
  { q: "كم عدد ساعات اليوم؟", a: ["24", "أربعة وعشرون"] },

  { q: "ما هي عاصمة بريطانيا؟", a: ["لندن", "london"] },
  { q: "ما هو الحيوان الذي يعطي الحليب؟", a: ["البقرة", "بقرة", "cow"] },
  { q: "كم عدد أصابع اليد الواحدة؟", a: ["5", "خمسة"] },
  { q: "ما هي عاصمة الصين؟", a: ["بكين", "beijing"] },
  { q: "كم عدد لاعبي فريق كرة القدم داخل الملعب؟", a: ["11", "أحد عشر"] },
  { q: "ما هي عاصمة الجزائر؟", a: ["الجزائر", "algiers"] },
  { q: "ما هو الحيوان المعروف بامتلاكه خرطوماً؟", a: ["الفيل", "elephant"] },
  { q: "ما هي عاصمة تونس؟", a: ["تونس", "tunis"] },
  { q: "كم عدد أيام السنة العادية؟", a: ["365", "ثلاثمائة وخمسة وستون"] },
  { q: "ما هو البحر الذي يفصل بين أوروبا وأفريقيا؟", a: ["البحر المتوسط", "المتوسط"] },

  { q: "ما هي عاصمة كندا؟", a: ["أوتاوا", "ottawa"] },
  { q: "ما هو الحيوان الذي يصدر صوت المواء؟", a: ["القط", "القطة", "cat"] },
  { q: "كم عدد أرجل الحشرة؟", a: ["6", "ستة"] },
  { q: "ما هي عاصمة الولايات المتحدة؟", a: ["واشنطن", "واشنطن العاصمة", "washington"] },
  { q: "ما هو العضو المسؤول عن ضخ الدم؟", a: ["القلب", "heart"] },
  { q: "ما هي عاصمة البرتغال؟", a: ["لشبونة", "lisbon"] },
  { q: "ما هو أكبر قارة في العالم؟", a: ["آسيا", "asia"] },
  { q: "ما هي عاصمة روسيا؟", a: ["موسكو", "moscow"] },
  { q: "ما هو الحيوان الذي يستطيع تغيير لونه؟", a: ["الحرباء", "chameleon"] },
  { q: "ما هي عاصمة البرازيل؟", a: ["برازيليا", "brasilia"] },

  { q: "كم عدد الكواكب في المجموعة الشمسية؟", a: ["8", "ثمانية"] },
  { q: "ما هو أقرب نجم إلى الأرض؟", a: ["الشمس", "sun"] },
  { q: "ما هي عاصمة أستراليا؟", a: ["كانبيرا", "canberra"] },
  { q: "ما هو أكبر حيوان بحري؟", a: ["الحوت الأزرق", "الحوت الازرق"] },
  { q: "كم عدد ألوان العلم المغربي؟", a: ["2", "اثنان"] },
  { q: "ما هي عاصمة هولندا؟", a: ["أمستردام", "amsterdam"] },
  { q: "ما هو العضو المسؤول عن التنفس؟", a: ["الرئتان", "الرئة"] },
  { q: "ما هي عاصمة اليونان؟", a: ["أثينا", "athens"] },
  { q: "ما هو الحيوان المعروف بالوفاء للإنسان؟", a: ["الكلب", "dog"] },
  { q: "ما هي عاصمة السويد؟", a: ["ستوكهولم", "stockholm"] },

  { q: "كم عدد ألوان العلم الفرنسي؟", a: ["3", "ثلاثة"] },
  { q: "ما هو أكبر محيط من حيث المساحة؟", a: ["الهادئ", "المحيط الهادئ"] },
  { q: "ما هي عاصمة النرويج؟", a: ["أوسلو", "oslo"] },
  { q: "ما هو الحيوان الذي يبيض؟", a: ["الدجاجة", "الدجاج", "الطيور"] },
  { q: "ما هي عاصمة سويسرا؟", a: ["برن", "bern"] },
  { q: "كم عدد أسنان الإنسان البالغ تقريباً؟", a: ["32", "اثنان وثلاثون"] },
  { q: "ما هو الكوكب المعروف بحلقاته؟", a: ["زحل", "saturn"] },
  { q: "ما هي عاصمة الهند؟", a: ["نيودلهي", "new delhi"] },
  { q: "ما هو الحيوان الذي يعيش في القطب الشمالي؟", a: ["الدب القطبي", "الدب الابيض"] },
  { q: "ما هي عاصمة المكسيك؟", a: ["مكسيكو سيتي", "مكسيكو", "mexico city"] },

  { q: "كم عدد حروف الأبجدية الإنجليزية؟", a: ["26", "ستة وعشرون"] },
  { q: "ما هو لون الزمرد؟", a: ["أخضر", "الاخضر", "الأخضر"] },
  { q: "ما هي عاصمة كوريا الجنوبية؟", a: ["سيول", "seoul"] },
  { q: "ما هي أكبر صحراء حارة في العالم؟", a: ["الصحراء الكبرى", "الصحراء الكبرى الافريقية"] },
  { q: "ما هي عاصمة النمسا؟", a: ["فيينا", "vienna"] },
  { q: "كم عدد أشهر السنة التي تحتوي على 31 يوماً؟", a: ["7", "سبعة"] },
  { q: "ما هو الحيوان الذي ينام واقفاً؟", a: ["الحصان", "horse"] },
  { q: "ما هي عاصمة الأرجنتين؟", a: ["بوينس آيرس", "buenos aires"] },
  { q: "ما هو أكبر عضو داخلي في جسم الإنسان؟", a: ["الكبد", "liver"] },
  { q: "ما هي عاصمة بلجيكا؟", a: ["بروكسل", "brussels"] },

  { q: "كم عدد أرجل الأخطبوط؟", a: ["8", "ثمانية"] },
  { q: "ما هو المعدن الذي رمزه Fe؟", a: ["الحديد", "iron"] },
  { q: "ما هي عاصمة إيرلندا؟", a: ["دبلن", "dublin"] },
  { q: "ما هو أسرع طائر في العالم؟", a: ["الصقر", "الشاهين", "peregrine falcon"] },
  { q: "ما هي عاصمة الدنمارك؟", a: ["كوبنهاغن", "copenhagen"] },
  { q: "كم عدد أضلاع المربع؟", a: ["4", "أربعة"] },
  { q: "ما الغاز الذي تحتاجه النباتات للبناء الضوئي؟", a: ["ثاني أكسيد الكربون", "ثاني اكسيد الكربون", "co2"] },
  { q: "ما هي عاصمة فنلندا؟", a: ["هلسنكي", "helsinki"] },
  { q: "ما هو الحيوان الذي له أطول رقبة؟", a: ["الزرافة", "giraffe"] },
  { q: "ما هي عاصمة نيوزيلندا؟", a: ["ويلينغتون", "wellington"] },

  { q: "كم عدد دقائق الساعة؟", a: ["60", "ستون"] },
  { q: "ما هو لون الياقوت الأحمر؟", a: ["أحمر", "الاحمر", "الأحمر"] },
  { q: "ما هي عاصمة التشيك؟", a: ["براغ", "prague"] },
  { q: "ما هو أكبر كوكب صخري؟", a: ["الأرض", "الارض", "earth"] },
  { q: "كم عدد ثواني الدقيقة؟", a: ["60", "ستون"] },
  { q: "ما هي عاصمة كوريا الشمالية؟", a: ["بيونغ يانغ", "بيونغ يانج", "pyongyang"] },
  { q: "ما هو الحيوان الذي ينتج العسل؟", a: ["النحل", "النحلة", "bee"] },
  { q: "ما هي عاصمة بولندا؟", a: ["وارسو", "warsaw"] },
  { q: "ما هو اسم القمر الطبيعي للأرض؟", a: ["القمر", "moon"] }
];

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[؟?!.,،؛:]/g, "")
    .replace(/\s+/g, " ");
}

function isCorrect(text, answers) {
  const clean = normalize(text);
  return answers.some(answer => normalize(answer) === clean);
}

function getScores(threadID) {
  if (!scores.has(threadID)) {
    scores.set(threadID, new Map());
  }

  return scores.get(threadID);
}

function getRandomQuestions() {
  return [...questions]
    .sort(() => Math.random() - 0.5)
    .slice(0, 10);
}

async function getName(api, uid) {
  try {
    const info = await api.getUserInfo(uid);
    return info[uid]?.name || "اللاعب";
  } catch (e) {
    return "اللاعب";
  }
}

async function sendQuestion(api, threadID) {
  const game = activeGames.get(threadID);

  if (!game || !game.running) return;

  if (game.index >= game.questions.length) {
    return finishGame(api, threadID);
  }

  const question = game.questions[game.index];

  game.waiting = true;
  game.winner = false;
  game.questionNumber++;

  await api.sendMessage(
    `🧠 السؤال ${game.questionNumber}/10\n\n` +
    `❓ ${question.q}\n\n` +
    `💰 قيمة السؤال: ${game.reward} درهم\n` +
    `⏱️ عندكم 20 ثانية!\n` +
    `💡 جاوب بسرعة!`,
    threadID
  );

  game.timer = setTimeout(async () => {
    const current = activeGames.get(threadID);

    if (!current || current !== game || !current.running) {
      return;
    }

    if (!current.waiting || current.winner) {
      return;
    }

    current.waiting = false;

    await api.sendMessage(
      `⏰ سالاو 20 ثانية!\n\n` +
      `❌ ما جاوب حتى واحد صحيح.\n` +
      `✅ الجواب الصحيح هو: ${question.a[0]}\n\n` +
      `➡️ السؤال الموالي...`,
      threadID
    );

    current.index++;

    // حتى السؤال الموالي تزيد الجائزة
    current.reward += 10;

    setTimeout(() => {
      sendQuestion(api, threadID);
    }, 1000);

  }, 20000);
}

async function finishGame(api, threadID) {
  const game = activeGames.get(threadID);

  if (!game) return;

  if (game.timer) {
    clearTimeout(game.timer);
    game.timer = null;
  }

  const groupScores = getScores(threadID);

  const ranking = [...groupScores.entries()]
    .sort((a, b) => b[1] - a[1]);

  let result =
    `🏁🎉 سالات الجولة!\n\n` +
    `💰🏆 ترتيب الأرباح:\n\n`;

  if (ranking.length === 0) {

    result +=
      `😅 ما ربح حتى واحد فلوس.\n\n` +
      `حظ موفق فالجولة الجاية!`;

  } else {

    for (let i = 0; i < ranking.length; i++) {

      const uid = ranking[i][0];
      const money = ranking[i][1];

      const name = await getName(api, uid);

      let medal = "";

      if (i === 0) medal = "🥇";
      else if (i === 1) medal = "🥈";
      else if (i === 2) medal = "🥉";
      else medal = `${i + 1}.`;

      result +=
        `${medal} ${name}\n` +
        `💰 ${money} درهم\n\n`;
    }

    result +=
      `🏆 مبروك للفائز!\n` +
      `🎉 شكراً للجميع على المشاركة!`;
  }

  activeGames.delete(threadID);

  return api.sendMessage(result, threadID);
}

module.exports = {

  config: {
    name: "quiz3",
    aliases: ["quiz3", "أسئلة3", "اسئلة3"],
    version: "5.0.0",
    author: "shtot",
    countDown: 3,
    role: 0,

    shortDescription: "لعبة أسئلة بالفلوس",
    category: "game",

    guide: {
      en:
        "{pn}\n" +
        "{pn} score\n" +
        "{pn} stop"
    }
  },

  onStart: async function ({ message, event, args, api }) {

    const threadID = event.threadID;
    const action = args[0]?.toLowerCase();

    // =========================
    // SCORE
    // =========================

    if (action === "score") {

      const groupScores = scores.get(threadID);

      if (!groupScores || groupScores.size === 0) {
        return message.reply(
          "📊 ما كاين حتى واحد ربح فلوس دابا."
        );
      }

      const ranking = [...groupScores.entries()]
        .sort((a, b) => b[1] - a[1]);

      let result =
        `🏆💰 ترتيب الأرباح:\n\n`;

      for (let i = 0; i < ranking.length; i++) {

        const uid = ranking[i][0];
        const money = ranking[i][1];

        const name = await getName(api, uid);

        let medal = "";

        if (i === 0) medal = "🥇";
        else if (i === 1) medal = "🥈";
        else if (i === 2) medal = "🥉";
        else medal = `${i + 1}.`;

        result +=
          `${medal} ${name}\n` +
          `💰 ${money} درهم\n\n`;
      }

      return message.reply(result);
    }

    // =========================
    // STOP
    // =========================

    if (action === "stop") {

      const game = activeGames.get(threadID);

      if (!game) {
        return message.reply(
          "❌ ما كايناش لعبة خدامة."
        );
      }

      if (game.timer) {
        clearTimeout(game.timer);
      }

      activeGames.delete(threadID);

      return message.reply(
        "🛑 توقفت لعبة الأسئلة."
      );
    }

    // =========================
    // GAME ALREADY RUNNING
    // =========================

    if (activeGames.has(threadID)) {

      return message.reply(
        "⚠️ راه كاينة لعبة خدامة دابا!"
      );
    }

    // =========================
    // START GAME
    // =========================

    const randomQuestions = getRandomQuestions();

    activeGames.set(threadID, {

      running: true,

      waiting: false,

      winner: false,

      index: 0,

      questionNumber: 0,

      questions: randomQuestions,

      timer: null,

      // أول سؤال = 40
      reward: 40
    });

    // نصفر أرباح الجولة
    scores.set(threadID, new Map());

    await message.reply(
      `🎮🔥 بدات لعبة Quiz3!\n\n` +
      `🧠 عدد الأسئلة: 10\n` +
      `⏱️ الوقت: 20 ثانية لكل سؤال\n` +
      `🥇 أول واحد يجاوب صحيح يربح\n` +
      `💰 أول سؤال: 40 درهم\n` +
      `📈 كل سؤال جديد: +10 دراهم\n` +
      `❌ الجواب الغلط: غير ❌ بلا كشف الجواب\n` +
      `🏆 فالآخر غادي نعطي ترتيب الأرباح\n\n` +
      `🚀 بالتوفيق للجميع!`
    );

    setTimeout(() => {
      sendQuestion(api, threadID);
    }, 1000);
  },

  // =========================
  // CHECK ANSWERS
  // =========================

  onChat: async function ({ event, api }) {

    const threadID = event.threadID;

    const game = activeGames.get(threadID);

    if (!game || !game.running || !game.waiting) {
      return;
    }

    if (!event.body) return;

    const question = game.questions[game.index];

    // =========================
    // CORRECT ANSWER
    // =========================

    if (isCorrect(event.body, question.a)) {

      // إذا شي واحد سبق وربح
      if (game.winner) {
        return;
      }

      game.winner = true;
      game.waiting = false;

      if (game.timer) {
        clearTimeout(game.timer);
        game.timer = null;
      }

      const uid = event.senderID;

      const groupScores = getScores(threadID);

      const oldMoney = groupScores.get(uid) || 0;

      const newMoney = oldMoney + game.reward;

      groupScores.set(uid, newMoney);

      const name = await getName(api, uid);

      // =========================
      // REACTION ✅
      // =========================

      try {

        await api.setMessageReaction(
          "✅",
          event.messageID,
          () => {},
          true
        );

      } catch (e) {}

      // =========================
      // REPLY على نفس رسالة اللاعب
      // =========================

      await api.sendMessage(
        {
          body:
            `🎉 جوابك صحيح!\n\n` +
            `💰 ربحتي: +${game.reward} درهم\n` +
            `💵 مجموع أرباحك: ${newMoney} درهم\n\n` +
            `🥳 مبروك ${name}!`,
          mentions: [
            {
              tag: name,
              id: uid
            }
          ]
        },
        threadID,
        undefined,
        event.messageID
      );

      // السؤال الموالي
      game.index++;

      // زيادة قيمة السؤال الموالي
      game.reward += 10;

      setTimeout(() => {
        sendQuestion(api, threadID);
      }, 1000);

      return;
    }

    // =========================
    // WRONG ANSWER
    // =========================

    try {

      await api.setMessageReaction(
        "❌",
        event.messageID,
        () => {},
        true
      );

    } catch (e) {}

    /*
     * مهم:
     * ما كنقولوش الجواب الصحيح هنا.
     * اللاعب عندو فرصة يعاود يحاول.
     * الجواب الصحيح كيبان غير منين تسالي 20 ثانية.
     */

    return;
  }
};
