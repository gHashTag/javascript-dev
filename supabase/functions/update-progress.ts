import { client } from "./utils/client.ts";

const supabase = client();

interface updateProgressContext {
  user_id: string;
  isTrue: boolean;
  path: string;
}

async function updateProgress(
  { user_id, isTrue, path }: updateProgressContext,
): Promise<void> {
  // Проверяем, существует ли запись в таблице javascript_progress для данного user_id
  const { data: progressData, error: progressError } = await supabase
    .from("javascript_progress")
    .select("user_id")
    .eq("user_id", user_id);

  if (progressError) throw new Error(progressError.message);

  if (progressData && progressData.length === 0) {
    // Если записи нет, создаем новую
    const { error: insertError } = await supabase
      .from("javascript_progress")
      .insert([{ user_id: user_id }]);

    if (insertError) throw new Error(insertError.message);
  } else {
    // Если запись существует, очищаем все поля, кроме user_id и created_at
    const { error: updateError } = await supabase
      .from("javascript_progress")
      .update({ [path]: isTrue })
      .eq("user_id", user_id);

    if (updateError) throw new Error(updateError.message);
  }
}

export { updateProgress };
