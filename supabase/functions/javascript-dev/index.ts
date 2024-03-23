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
import { pathDecrement } from "../path-decrement.ts";

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
  const isHaveAnswer = callbackData.split("_").length === 4;

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
          image_lesson_url,
        } = questions[0];

        // Формируем сообщение
        const messageText =
          `${topic}\n\n<i><u>Теперь мы предлагаем вам закрепить полученные знания.</u></i>\n\n<b>🎯 Ваш счёт: 0XP </b>`;

        // Формируем кнопки
        const inlineKeyboard = [
          [{
            text: "Перейти к вопросу",
            callback_data: `javascript_01_01`,
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

  if (!isHaveAnswer) {
    try {
      const [language, lesson, subtopic] = callbackData.split("_");
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
          "Одно из значений некорректно(114):",
          lesson,
          subtopic,
          callbackData,
        );
        await ctx.reply(
          "Одно из значений некорректно. Пожалуйста, проверьте данные.",
        );
        return;
      }
      const {
        question,
        variant_0,
        variant_1,
        variant_2,
        id,
      } = questions[0];

      const biggestSubtopic = await getBiggest(Number(lesson));
      const ifSubtopic = biggestSubtopic === Number(subtopic) ? false : true;
      const newPath = pathIncrement({
        isSubtopic: ifSubtopic,
        path: callbackData,
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
          "Одно из значений некорректно(143):",
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

      const trueCount = await trueCounter(user_id);

      if (newQuestions.length > 0) {
        // Формируем сообщение
        const messageText =
          `<b>Вопрос №${id}</b>\n\n${question}\n\n<b>🎯 Ваш счёт: ${trueCount}XP </b>`;

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
        await ctx.editMessageCaption({
          reply_markup: { inline_keyboard: inlineKeyboard },
          caption: messageText,
          parse_mode: "HTML",
        });
        return;
      }
    } catch (error) {
      console.error(error);
      await ctx.reply(
        `Произошла ошибка при получении вопроса. ${callbackData}`,
      );
    }
  }

  if (isHaveAnswer) {
    try {
      const [language, lesson_number, subtopic, answer] = callbackData.split(
        "_",
      );
      const questionContext = {
        lesson_number: Number(lesson_number),
        subtopic: Number(subtopic),
      };

      const questions = await getQuestion(questionContext);
      if (questions.length > 0) {
        const {
          topic,
          image_lesson_url,
        } = questions[0];

        const user_id = await getUid(ctx.callbackQuery.from.username || "");
        if (!user_id) {
          await ctx.reply("Пользователь не найден.");
          return;
        }

        const path = `${language}_${lesson_number}_${subtopic}`;
        const biggestSubtopic = await getBiggest(Number(lesson_number));
        const prevPath = pathDecrement({
          path,
          biggestSubtopic: biggestSubtopic || 0,
        });
        const [prevLanguage, prevLesson, prevSubtopic] = prevPath.split("_");
        const prevQuestoins = await getQuestion({
          lesson_number: Number(prevLesson),
          subtopic: Number(prevSubtopic),
        });
        const { correct_option_id: prevCorrectOptionId } = prevQuestoins[0];
        let isTrueAnswer = null;
        if (prevCorrectOptionId === Number(answer)) {
          isTrueAnswer = true;
        } else {
          isTrueAnswer = false;
        }
        await updateProgress({ user_id, isTrue: isTrueAnswer, path: prevPath });
        const trueCount = await trueCounter(user_id);

        // Формируем сообщение
        const messageText =
          `${topic}\n\n<i><u>Теперь мы предлагаем вам закрепить полученные знания.</u></i>\n\n<b>🎯 Ваш счёт: ${trueCount}XP </b>`;

        // Формируем кнопки
        const inlineKeyboard = [
          [{
            text: "Перейти к вопросу",
            callback_data: `${language}_${lesson_number}_${subtopic}`,
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
  return;
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
