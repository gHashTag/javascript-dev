import { client } from "./utils/client.ts";

const supabase = client();

interface updateProgressContext {
  username: string;
  isTrue: boolean;
  path: string;
}

async function updateProgress(
  { username, isTrue, path }: updateProgressContext,
): Promise<void> {
  // Получаем user_id по username из таблицы users
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("user_id")
    .eq("username", username)
    .single();

  if (userError || !userData) {
    throw new Error(userError?.message || "User not found");
  }

  const userId = userData.user_id;

  // Проверяем, существует ли запись в таблице javascript_progress для данного user_id
  const { data: progressData, error: progressError } = await supabase
    .from("javascript_progress")
    .select("user_id")
    .eq("user_id", userId);

  if (progressError) throw new Error(progressError.message);

  if (progressData && progressData.length === 0) {
    // Если записи нет, создаем новую
    const { error: insertError } = await supabase
      .from("javascript_progress")
      .insert([{ user_id: userId }]);

    if (insertError) throw new Error(insertError.message);
  } else {
    // Если запись существует, очищаем все поля, кроме user_id и created_at
    const { error: updateError } = await supabase
      .from("javascript_progress")
      .update({ [path]: isTrue })
      .eq("user_id", userId);

    if (updateError) throw new Error(updateError.message);
  }
}

export { updateProgress };
