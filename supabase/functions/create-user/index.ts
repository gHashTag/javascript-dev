import { client } from "../utils/client.ts";

// Переписываем код на обычную JavaScript функцию
async function createUser(req: Request) {
  const supabaseClient = client(req);

  const {
    first_name,
    last_name,
    username,
    is_bot,
    language_code,
    telegram_id,
    email,
    avatar,
  } = await req.json();
  const usersData = {
    first_name,
    last_name,
    username,
    is_bot,
    language_code,
    telegram_id,
    email,
    avatar,
  };

  const data = await supabaseClient
    .from("users")
    .insert([{ ...usersData }]);

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  );
}

export { createUser };
