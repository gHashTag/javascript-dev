import { client } from "./utils/client.ts";

async function createUser(ctx: any) {
  const supabaseClient = client();

  const {
    first_name,
    last_name,
    username,
    is_bot,
    language_code,
    id,
  } = ctx.update.message.from;

  // Проверяем, существует ли уже пользователь с таким telegram_id
  const { data: existingUser, error } = await supabaseClient
    .from("users")
    .select("*")
    .eq("telegram_id", id)
    .maybeSingle();

  if (error && error.message !== "No rows found") {
    console.error("Ошибка при проверке существования пользователя:", error);
    return;
  }

  // Если пользователь существует, прекращаем выполнение функции
  if (existingUser) {
    console.log("Пользователь уже существует:", existingUser);
    return;
  }

  // Если пользователя нет, создаем нового
  const usersData = {
    first_name,
    last_name,
    username,
    is_bot,
    language_code,
    telegram_id: id,
    email: "",
    avatar: "",
  };

  const { data, error: insertError } = await supabaseClient.from("users")
    .insert([usersData]);

  if (insertError) {
    console.error("Ошибка при создании пользователя:", insertError);
    return;
  }

  return data;
}

export { createUser };
