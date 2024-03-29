import { client } from "./utils/client.ts";

async function getUid(username: string) {
  const supabaseClient = client();

  // Запрос к таблице users для получения user_id по username
  const { data, error } = await supabaseClient
    .from("users")
    .select("user_id")
    .eq("username", username)
    .single();

  if (error) {
    console.error("Ошибка при получении user_id:", error.message);
    throw new Error(error.message);
  }

  if (!data) {
    console.error("Пользователь не найден");
    return null; // или выбросить ошибку, если пользователь должен существовать
  }

  // Возвращаем user_id
  return data.user_id;
}

export { getUid };
