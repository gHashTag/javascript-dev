import { Bot, webhookCallback } from "https://deno.land/x/grammy@v1.8.3/mod.ts";

if (!Deno.env.get("TELEGRAM_BOT_TOKEN")) {
  throw new Error("TELEGRAM_BOT_TOKEN is not set");
}

export const bot = new Bot(Deno.env.get("TELEGRAM_BOT_TOKEN") || "");

export const handleUpdate = webhookCallback(bot, "std/http");
