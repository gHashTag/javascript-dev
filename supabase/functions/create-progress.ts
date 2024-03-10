import { client } from "./utils/client.ts";

async function createProgress(user_id: any) {
  const supabase = client();

  if (!user_id) {
    console.error("Пользователь не найден", user_id, "🎯");
    return; // Возвращаем управление, не продолжая выполнение
  }

  // Проверка наличия user_id в таблице javascript_progress
  const { data: progressData, error: progressError } = await supabase
    .from("javascript_progress")
    .select("*")
    .eq("user_id", user_id);

  if (progressError) {
    console.error("Ошибка при проверке прогресса пользователя:", progressError);
    return; // Возвращаем управление, не продолжая выполнение
  }

  // Если данные о прогрессе уже существуют, не добавляем новую запись
  if (progressData.length > 0) {
    console.log("Данные о прогрессе пользователя уже существуют");
    return; // Данные уже существуют, выходим из функции
  }

  // Добавляем новую запись, если она отсутствует
  const { error: insertError } = await supabase
    .from("javascript_progress")
    .insert([{
      user_id: user_id, /* другие поля, которые вы хотите добавить */
    }]);

  if (insertError) {
    console.error("Ошибка при добавлении прогресса пользователя:", insertError);
    return; // Возвращаем управление, не продолжая выполнение
  }
}

export { createProgress };
