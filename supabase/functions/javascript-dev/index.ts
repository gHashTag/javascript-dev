// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { Bot, webhookCallback } from "https://deno.land/x/grammy@v1.8.3/mod.ts";
import { createUser } from "../create-user.ts";
import { getQuestion } from "../get-question.ts";
import { resetProgress } from "../reset-progress.ts";
import { getBiggest } from "../get-biggest.ts";
import { pathIncrement } from "../path-increment.ts";
import { updateProgress } from "../update-progress.ts";
import { trueCounter } from "../true-counter.ts";

const bot = new Bot(Deno.env.get("BOT_TOKEN") || "");

bot.command("start", (ctx) => {
  createUser(ctx);
  ctx.reply(
    `Hi, ${ctx.update.message?.from.first_name}! 🚀 Давай начнем с тестов – выбери один из них, чтобы проверить свои знания и подготовиться к захватывающему путешествию в мир программирования! 🖥️✨ `,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Начать тест!", callback_data: "javascript_01_01" }],
        ],
      },
    },
  );
});

bot.command(
  "ping",
  (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`),
);

bot.on("callback_query:data", async (ctx) => {
  const callbackData = ctx.callbackQuery.data;

  if (callbackData === "javascript_01_01") {
    try {
      resetProgress(ctx.callbackQuery.from.username || "");
      const questionContext = {
        lesson_number: 1,
        subtopic: 1,
      };

      const questions = await getQuestion(questionContext);
      if (questions.length > 0) {
        const {
          topic,
          question,
          variant_0,
          variant_1,
          variant_2,
          image_lesson_url,
        } = questions[0];

        // Формируем сообщение
        const messageText =
          `${topic}\n\n<i><u>Теперь мы предлагаем вам закрепить полученные знания:</u></i>\n\n<b>Вопрос №1</b>\n\n${question}\n\n<b>🎯 Ваш счёт: 0XP </b>`;

        // Формируем кнопки
        const inlineKeyboard = [
          [{
            text: variant_0 || "Вариант 1",
            callback_data: `${callbackData}_0`,
          }],
          [{
            text: variant_1 || "Вариант 2",
            callback_data: `${callbackData}_1`,
          }],
          [{
            text: variant_2 || "Вариант 3",
            callback_data: `${callbackData}_2`,
          }],
        ];

        // Отправляем сообщение
        await ctx.replyWithPhoto(image_lesson_url, {
          caption: messageText,
          parse_mode: "HTML",
          reply_markup: { inline_keyboard: inlineKeyboard },
        });
        return;
      } else {
        ctx.reply("Вопросы не найдены.");
      }
    } catch (error) {
      console.error(error);
      await ctx.reply("Произошла ошибка при получении вопроса.");
    }
  }

  // if (callbackData.split("_").length > 3) {
  //   const [lesson, subtopic, answer] = callbackData.split("_");
  //   const questions = await getQuestion({
  //     lesson_number: Number(lesson),
  //     subtopic: Number(subtopic),
  //   });
  //   const { correct_answer } = questions[0];
  //   let isTrueAnswer = null;
  //   if (correct_answer === answer) {
  //     isTrueAnswer = true;
  //   } else {
  //     isTrueAnswer = false;
  //   }
  //   const biggestSubtopic = await getBiggest(Number(lesson));
  //   const ifSubtopic = biggestSubtopic === Number(subtopic) ? true : false;
  //   const newPath = pathIncrement({
  //     isSubtopic: ifSubtopic,
  //     path: callbackData.slice(0, -2),
  //   });
  //   const [newLesson, newSubtopic] = newPath.split("_");
  //   const newQuestionContext = {
  //     lesson_number: Number(newLesson),
  //     subtopic: Number(newSubtopic),
  //   };
  //   const newQuestion = await getQuestion(newQuestionContext);
  //   updateProgress({
  //     username: ctx.callbackQuery.from.username || "",
  //     isTrue: isTrueAnswer,
  //     path: newPath,
  //   });
  //   const trueCount = await trueCounter({
  //     user_id: ctx.callbackQuery.from.username || "",
  //   });

  //   const {
  //     topic,
  //     question,
  //     variant_0,
  //     variant_1,
  //     variant_2,
  //     image_lesson_url,
  //     id,
  //   } = newQuestion[0];

  //   // Формируем сообщение
  //   const messageText =
  //     `${topic}\n\n<i><u>Теперь мы предлагаем вам закрепить полученные знания:</u></i>\n\n<b>Вопрос №${id}</b>\n\n${question}\n\n<b>🎯 Ваш счёт: ${trueCount}XP </b>`;

  //   // Формируем кнопки
  //   const inlineKeyboard = [
  //     [{
  //       text: variant_0 || "Вариант 1",
  //       callback_data: `${newPath}_0`,
  //     }],
  //     [{
  //       text: variant_1 || "Вариант 2",
  //       callback_data: `${newPath}_1`,
  //     }],
  //     [{
  //       text: variant_2 || "Вариант 3",
  //       callback_data: `${newPath}_2`,
  //     }],
  //   ];

  //   // Отправляем сообщение
  //   await ctx.replyWithPhoto(image_lesson_url, {
  //     caption: messageText,
  //     parse_mode: "HTML",
  //     reply_markup: { inline_keyboard: inlineKeyboard },
  //   });
  //   return;
  // }
  ctx.reply(ctx.callbackQuery.data);
  return;
});

const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("secret") !== Deno.env.get("FUNCTION_SECRET")) {
      return new Response("not allowed", { status: 405 });
    }

    return await handleUpdate(req);
  } catch (err) {
    console.error(err);
  }
});
