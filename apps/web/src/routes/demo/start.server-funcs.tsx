import fs from "node:fs";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Schema } from "effect";
import { FormField } from "@/components/form/form-field";
import { Button } from "@/components/ui/button";

/*
const loggingMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    console.log("Request:", request.url);
    return next();
  }
);
const loggedServerFunction = createServerFn({ method: "GET" }).middleware([
  loggingMiddleware,
]);
*/

type Todo = {
  id: number;
  name: string;
};

const TODOS_FILE = "todos.json";

async function readTodos(): Promise<Todo[]> {
  return JSON.parse(
    await fs.promises.readFile(TODOS_FILE, "utf-8").catch(() =>
      JSON.stringify(
        [
          { id: 1, name: "Get groceries" },
          { id: 2, name: "Buy a new phone" },
        ],
        null,
        2,
      ),
    ),
  );
}

const getTodos = createServerFn({
  method: "GET",
}).handler(async () => await readTodos());

const addTodo = createServerFn({ method: "POST" })
  .inputValidator((d: string) => d)
  .handler(async ({ data }) => {
    const todos = await readTodos();
    todos.push({ id: todos.length + 1, name: data });
    await fs.promises.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2));
    return todos;
  });

const todoSchema = Schema.Struct({
  name: Schema.String.pipe(
    Schema.minLength(1, { message: () => "Todo name is required" }),
  ),
});

export const Route = createFileRoute("/demo/start/server-funcs")({
  component: Home,
  loader: async () => await getTodos(),
});

function Home() {
  const router = useRouter();
  const todos = Route.useLoaderData();

  const form = useForm({
    defaultValues: { name: "" },
    validators: {
      onChange: Schema.standardSchemaV1(todoSchema),
    },
    onSubmit: async ({ value }) => {
      await addTodo({ data: value.name });
      form.reset();
      router.invalidate();
    },
  });

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-800 to-black p-4 text-white"
      style={{
        backgroundImage:
          "radial-gradient(50% 50% at 20% 60%, #23272a 0%, #18181b 50%, #000000 100%)",
      }}
    >
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
        <h1 className="text-2xl mb-4">Start Server Functions - Todo Example</h1>
        <ul className="mb-4 space-y-2">
          {todos?.map((t: Todo) => (
            <li
              key={t.id}
              className="bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-sm shadow-md"
            >
              <span className="text-lg text-white">{t.name}</span>
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-3"
        >
          <form.Field name="name">
            {(field) => (
              <FormField field={field} placeholder="Enter a new todo..." />
            )}
          </form.Field>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Adding..." : "Add todo"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </div>
  );
}
