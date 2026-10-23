type Row = Record<string, unknown> & { _id: string };
import type { GenericMutationCtx, RegisteredMutation } from "convex/server";
import type { DataModel } from "../../convex/lib/functions";

/** Convex attaches _handler at runtime; it strips that internal property from public typings. */
export function handlerOf<Args extends Record<string, unknown>, Result>(
  mutation: RegisteredMutation<"public" | "internal", Args, Result>,
): (ctx: GenericMutationCtx<DataModel>, args: Args) => Result {
  return (
    mutation as unknown as {
      _handler: (ctx: GenericMutationCtx<DataModel>, args: Args) => Result;
    }
  )._handler;
}

/** Minimal indexed DB fixture; exercises the exported production handlers. */
export function mutationFixture() {
  const tables = new Map<string, Map<string, Row>>();
  let sequence = 0;
  function table(name: string) {
    if (!tables.has(name)) tables.set(name, new Map());
    return tables.get(name)!;
  }
  const db = {
    query(name: string) {
      let matches: (row: Row) => boolean = () => true;
      const query = {
        withIndex(
          _name: string,
          configure: (index: {
            eq: (field: string, value: unknown) => void;
            lt: (field: string, value: number) => void;
          }) => unknown,
        ) {
          configure({
            eq: (field, value) => {
              matches = (row) => row[field] === value;
            },
            lt: (field, value) => {
              matches = (row) => (row[field] as number) < value;
            },
          });
          return query;
        },
        async unique() {
          const rows = [...table(name).values()].filter(matches);
          if (rows.length > 1) throw new Error("not_unique");
          return rows[0] ?? null;
        },
        async take(count: number) {
          return [...table(name).values()].filter(matches).slice(0, count);
        },
      };
      return query;
    },
    async insert(name: string, value: Record<string, unknown>) {
      const id = `${name}-${++sequence}`;
      table(name).set(id, { ...value, _id: id });
      return id;
    },
    async patch(id: string, value: Record<string, unknown>) {
      for (const rows of tables.values()) {
        if (rows.has(id)) {
          Object.assign(rows.get(id)!, value);
          return;
        }
      }
      throw new Error("missing_row");
    },
    async delete(id: string) {
      for (const rows of tables.values()) rows.delete(id);
    },
  };
  return { ctx: { db }, rows: (name: string) => [...table(name).values()] };
}
