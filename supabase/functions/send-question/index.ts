import { client } from "../utils/client.ts";

Deno.serve(async (req) => {
  const supabaseClient = client(req);
  try {
    // Проверяем, что запрос является POST запросом
    if (req.method !== "POST") {
      return new Response("Только POST запросы разрешены", { status: 405 });
    }

    // Получаем данные из тела запроса
    const { lesson_number, subtopic } = await req.json();

    // Выполняем запрос к таблице 'javascript'
    const { data, error } = await supabaseClient
      .from("javascript")
      .select(
        "question, topic, subtopic, id, image_lesson_url, variant_0, variant_1, variant_2, correct_option_id",
      )
      .eq("lesson_number", lesson_number)
      .eq("subtopic", subtopic);

    if (error) {
      throw error;
    }

    // Отправляем ответ с данными
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    // Обработка ошибок
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
