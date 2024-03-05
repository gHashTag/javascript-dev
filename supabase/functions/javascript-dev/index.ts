import { createUser } from "../create-user/index.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Only POST requests are allowed", { status: 405 });
  }

  const { action, ...params } = await req.json();

  switch (action) {
    case "create-user":
      createUser(params);
      return new Response(JSON.stringify({ message: "User created" }), {
        headers: { "Content-Type": "application/json" },
      });
    case "is-true-answer":
      // Логика для проверки ответа
      return new Response(JSON.stringify({ message: "Answer checked" }), {
        headers: { "Content-Type": "application/json" },
      });
    // Добавьте дополнительные case для других действий
    default:
      return new Response("Action not found", { status: 404 });
  }
});
