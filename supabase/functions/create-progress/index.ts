import { client } from "../utils/client.ts";

Deno.serve(async (req) => {
  const supabaseClient = client(req);

  const { username } = await req.json();
  if (!username) {
    return new Response("Необходимо указать username", { status: 400 });
  }

  // Получение user_id по username из таблицы users
  const { data: userData, error: userError } = await supabaseClient
    .from("users")
    .select("user_id")
    .eq("username", username)
    .single();

  if (userError) {
    console.error(userError);
    return new Response("Ошибка при получении данных пользователя", {
      status: 500,
    });
  }

  if (!userData) {
    return new Response("Пользователь не найден", { status: 404 });
  }

  const userId = userData.user_id;

  // Проверка наличия user_id в таблице javascript_progress
  const { data: progressData, error: progressError } = await supabaseClient
    .from("javascript_progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (progressError) {
    console.error(progressError);
    return new Response("Ошибка при проверке прогресса пользователя", {
      status: 500,
    });
  }

  // Если данных о прогрессе нет, добавляем новую строку
  if (!progressData) {
    const { data: insertData, error: insertError } = await supabaseClient
      .from("javascript_progress")
      .insert([
        { user_id: userId /* другие поля, которые вы хотите добавить */ },
      ])
      .single();

    if (insertError) {
      console.error(insertError);
      return new Response("Ошибка при добавлении прогресса пользователя", {
        status: 500,
      });
    }

    // Возвращаем добавленные данные
    return new Response(JSON.stringify(insertData), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  // Если данные о прогрессе есть, возвращаем их
  return new Response(
    JSON.stringify(progressData),
    { headers: { "Content-Type": "application/json" }, status: 200 },
  );
});
