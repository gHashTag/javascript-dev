// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { createUser } from "../create-user.ts";
import { getAiFeedback } from "../get-ai-feedback.ts";
import { bot, handleUpdate } from "../utils/bot.ts";

console.log("Hello from Functions!");

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
  } catch (error) {
    console.error("Ошибка при получении ответа AI:", error);
  }
});

bot.start();

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    console.log(url, "url");
    // if (
    //   url.searchParams.get("secret") !==
    //     Deno.env.get("NEXT_PUBLIC_SUPABASE_FUNCTION_SECRET")
    // ) {
    //   return new Response("not allowed", { status: 405 });
    // }

    const result = await handleUpdate(req);
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

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/telegram-bot' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
