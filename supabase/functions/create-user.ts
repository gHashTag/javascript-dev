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

  const data = await supabaseClient.from("users").insert([{ ...usersData }]);

  return new Response(
    JSON.stringify(data),
    { headers: { "Content-Type": "application/json" } },
  );
}

export { createUser };
