import { client } from "../utils/client.ts";

Deno.serve(async (req: Request) => {
  const supabase = client(req);

  if (req.method !== "POST") {
    return new Response("Only POST requests are allowed", { status: 405 });
  }

  // Получение user_id из тела запроса
  const { user_id } = await req.json();
  if (!user_id) {
    return new Response("user_id is required", { status: 400 });
  }

  // Запрос к базе данных для подсчета true значений
  const { data, error } = await supabase
    .from("javascript_progress")
    .select("*")
    .eq("user_id", user_id)
    .single();

  if (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  if (!data) {
    return new Response("User not found", { status: 404 });
  }

  // Подсчет количества true значений
  const trueCount = Object.values(data).filter((value) =>
    value === true
  ).length;

  return new Response(JSON.stringify({ trueCount }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
