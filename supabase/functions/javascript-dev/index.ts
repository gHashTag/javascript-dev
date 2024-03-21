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
import { getUid } from "../get-uid.ts";
import { getAiFeedback } from "../get-ai-feedback.ts";

const bot = new Bot(Deno.env.get("BOT_TOKEN") || "");

bot.command("start", async (ctx) => {
  await ctx.replyWithChatAction("typing");
  createUser(ctx);
  ctx.reply(
    `Hi, ${ctx.update.message?.from.first_name}! 🚀 Давай начнем с тестов – выбери один из них, чтобы проверить свои знания и подготовиться к захватывающему путешествию в мир программирования! 🖥️✨ `,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Начать тест!", callback_data: "start_test" }],
        ],
      },
    },
  );
});

bot.command(
  "ping",
  (ctx) => ctx.reply(`Pong! ${new Date()} ${Date.now()}`),
);

bot.on("message:text", async (ctx) => {
  await ctx.replyWithChatAction("typing");
  const text = ctx.message.text;
  try {
    const feedback = await getAiFeedback(text);
    await ctx.reply(feedback, { parse_mode: "Markdown" });
    return;
  } catch (error) {
    console.error("Ошибка при получении ответа AI:", error);
    await ctx.reply("Произошла ошибка при обработке вашего сообщения.");
    return;
  }
});

bot.on("callback_query:data", async (ctx) => {
  await ctx.replyWithChatAction("typing");
  const callbackData = ctx.callbackQuery.data;

  if (callbackData === "start_test") {
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
            callback_data: `javascript_01_01_0`,
          }],
          [{
            text: variant_1 || "Вариант 2",
            callback_data: `javascript_01_01_1`,
          }],
          [{
            text: variant_2 || "Не знаю",
            callback_data: `javascript_01_01_2`,
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
  } else if (callbackData.startsWith("javascript_")) {
    const [language, lesson, subtopic, answer] = callbackData.split("_");
    let questions;
    if (!isNaN(Number(lesson)) && !isNaN(Number(subtopic))) {
      // Значения корректны, вызываем функцию.
      questions = await getQuestion({
        lesson_number: Number(lesson),
        subtopic: Number(subtopic),
      });
    } else {
      // Одно из значений некорректно, обрабатываем ошибку.
      console.error(
        "Одно из значений некорректно:",
        lesson,
        subtopic,
        callbackData,
      );
      return;
    }
    const { correct_option_id } = questions[0];
    let isTrueAnswer = null;
    if (correct_option_id === Number(answer)) {
      isTrueAnswer = true;
    } else {
      isTrueAnswer = false;
    }
    const biggestSubtopic = await getBiggest(Number(lesson));
    const ifSubtopic = biggestSubtopic === Number(subtopic) ? false : true;
    const newPath = pathIncrement({
      isSubtopic: ifSubtopic,
      path: callbackData.slice(0, -2),
    });
    const [newLanguage, newLesson, newSubtopic] = newPath.split("_");
    let newQuestions;
    if (!isNaN(Number(newLesson)) && !isNaN(Number(newSubtopic))) {
      // Значения корректны, вызываем функцию.
      newQuestions = await getQuestion({
        lesson_number: Number(newLesson),
        subtopic: Number(newSubtopic),
      });
    } else {
      // Одно из значений некорректно, обрабатываем ошибку.
      console.error(
        "Одно из значений некорректно:",
        newLesson,
        newSubtopic,
        callbackData,
      );
      await ctx.reply("Произошла ошибка при получении нового вопроса.");
      return;
    }

    const user_id = await getUid(ctx.callbackQuery.from.username || "");
    if (!user_id) {
      await ctx.reply("Пользователь не найден.");
      return;
    }
    await updateProgress({
      user_id: user_id,
      isTrue: isTrueAnswer,
      path: `${language}_${lesson}_${subtopic}`,
    });
    const trueCount = await trueCounter(user_id);
    if (newQuestions.length > 0) {
      const {
        topic,
        question,
        variant_0,
        variant_1,
        variant_2,
        image_lesson_url,
        id,
      } = newQuestions[0];

      if (newPath === "javascript_30_01") {
        await ctx.replyWithPhoto(image_lesson_url, {
          caption:
            `Поздравляем! Вы прошли тест по JavaScript. Ваш счёт: ${trueCount}XP`,
          parse_mode: "HTML",
        });
        return;
      }

      // Формируем сообщение
      const messageText =
        `${topic}\n\n<i><u>Теперь мы предлагаем вам закрепить полученные знания:</u></i>\n\n<b>Вопрос №${id}</b>\n\n${question}\n\n<b>🎯 Ваш счёт: ${trueCount}XP </b>`;

      // Формируем кнопки
      const inlineKeyboard = [
        [{
          text: variant_0 || "Вариант 1",
          callback_data: `${newPath}_0`,
        }],
        [{
          text: variant_1 || "Вариант 2",
          callback_data: `${newPath}_1`,
        }],
        [{
          text: variant_2 || "Не знаю",
          callback_data: `${newPath}_2`,
        }],
      ];
      // Отправляем сообщение
      await ctx.replyWithPhoto(image_lesson_url, {
        caption: messageText,
        parse_mode: "HTML",
        reply_markup: { inline_keyboard: inlineKeyboard },
      });
      return;
    }
    ctx.reply(ctx.callbackQuery.data);
    return;
  }
});

const handleUpdate = webhookCallback(bot, "std/http");

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    if (url.searchParams.get("secret") !== Deno.env.get("FUNCTION_SECRET")) {
      return new Response("not allowed", { status: 405 });
    }

    const result = await handleUpdate(req);
    // Убедитесь, что result является объектом Response.
    // Если нет, вы можете обернуть результат в Response или обработать иначе.
    if (!(result instanceof Response)) {
      console.error("handleUpdate не вернул объект Response", result);
      return new Response("Internal Server Error", { status: 500 });
    }
    return result;
  } catch (err) {
    console.error("Ошибка при обработке запроса:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
