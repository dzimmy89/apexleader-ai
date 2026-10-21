/**
 * In-memory Firestore stand-in for tsx tests. Supports what the contact
 * page, payment ledger, and 1:1 send use: doc get/set/update/create/delete,
 * add, collection get, chained == where, limit, orderBy (no-op sort by
 * field), transactions (get/set/create/update), batches, and getAll.
 */
type Stored = Record<string, unknown>;

export class AlreadyExistsError extends Error {
  code = 6;
  constructor() {
    super("ALREADY_EXISTS: Document already exists");
  }
}

export function createMemoryFirestore() {
  const store = new Map<string, Stored>();
  let autoId = 0;
  let txChain: Promise<unknown> = Promise.resolve();

  const clone = (data: Stored) => JSON.parse(JSON.stringify(data)) as Stored;

  function docRef(name: string, id: string) {
    const key = `${name}/${id}`;
    const ref = {
      id,
      path: key,
      __key: key,
      async get() {
        const data = store.get(key);
        return { id, exists: data !== undefined, data: () => data, ref };
      },
      async set(data: Stored, options?: { merge?: boolean }) {
        const next = options?.merge ? { ...(store.get(key) || {}), ...data } : data;
        store.set(key, clone(next));
      },
      async update(data: Stored) {
        const existing = store.get(key);
        if (!existing) throw new Error(`NOT_FOUND ${key}`);
        store.set(key, clone({ ...existing, ...data }));
      },
      async create(data: Stored) {
        if (store.has(key)) throw new AlreadyExistsError();
        store.set(key, clone(data));
      },
      async delete() {
        store.delete(key);
      },
    };
    return ref;
  }

  function query(name: string, filters: Array<{ field: string; value: unknown }>, max?: number, order?: { field: string; dir: string }) {
    const q = {
      where(field: string, op: string, value: unknown) {
        if (op !== "==") throw new Error(`unsupported where ${op}`);
        return query(name, [...filters, { field, value }], max, order);
      },
      limit(n: number) {
        return query(name, filters, n, order);
      },
      orderBy(field: string, dir = "asc") {
        return query(name, filters, max, { field, dir });
      },
      async get() {
        let docs: Array<{ id: string; exists: boolean; data: () => Stored; ref: ReturnType<typeof docRef> }> = [];
        for (const [docKey, data] of store) {
          if (!docKey.startsWith(`${name}/`)) continue;
          const id = docKey.slice(name.length + 1);
          if (id.includes("/")) continue;
          if (filters.every((f) => data[f.field] === f.value)) {
            docs.push({ id, exists: true, data: () => data, ref: docRef(name, id) });
          }
        }
        if (order) {
          docs.sort((a, b) => {
            const av = String(a.data()[order.field] ?? "");
            const bv = String(b.data()[order.field] ?? "");
            const cmp = av < bv ? -1 : av > bv ? 1 : 0;
            return order.dir === "desc" ? -cmp : cmp;
          });
        }
        if (typeof max === "number") docs = docs.slice(0, max);
        return { empty: docs.length === 0, docs, size: docs.length };
      },
    };
    return q;
  }

  const collection = (name: string) => ({
    ...query(name, []),
    doc(id: string) {
      return docRef(name, id);
    },
    async add(data: Stored) {
      autoId += 1;
      const id = `auto_${autoId}`;
      store.set(`${name}/${id}`, clone(data));
      return { id };
    },
  });

  type Ref = ReturnType<typeof docRef>;

  return {
    store,
    collection,
    batch() {
      const ops: Array<() => Promise<void>> = [];
      return {
        set(ref: Ref, data: Stored, options?: { merge?: boolean }) {
          ops.push(() => ref.set(data, options));
        },
        update(ref: Ref, data: Stored) {
          ops.push(() => ref.update(data));
        },
        create(ref: Ref, data: Stored) {
          ops.push(() => ref.create(data));
        },
        delete(ref: Ref) {
          ops.push(() => ref.delete());
        },
        async commit() {
          for (const op of ops) await op();
        },
      };
    },
    async getAll(...refs: Ref[]) {
      return Promise.all(refs.map((ref) => ref.get()));
    },
    runTransaction<T>(fn: (tx: {
      get: (ref: Ref) => ReturnType<Ref["get"]>;
      set: (ref: Ref, data: Stored, options?: { merge?: boolean }) => void;
      create: (ref: Ref, data: Stored) => void;
      update: (ref: Ref, data: Stored) => void;
      delete: (ref: Ref) => void;
    }) => Promise<T>): Promise<T> {
      const run = async () => {
        const ops: Array<() => Promise<void>> = [];
        const tx = {
          get: (ref: Ref) => ref.get(),
          set: (ref: Ref, data: Stored, options?: { merge?: boolean }) => {
            ops.push(() => ref.set(data, options));
          },
          create: (ref: Ref, data: Stored) => {
            ops.push(() => ref.create(data));
          },
          update: (ref: Ref, data: Stored) => {
            ops.push(() => ref.update(data));
          },
          delete: (ref: Ref) => {
            ops.push(() => ref.delete());
          },
        };
        const result = await fn(tx);
        for (const op of ops) await op();
        return result;
      };
      const next = txChain.then(run, run);
      txChain = next.then(
        () => undefined,
        () => undefined
      );
      return next;
    },
  };
}

export type MemoryFirestore = ReturnType<typeof createMemoryFirestore>;

export function rows(store: Map<string, Stored>, collectionName: string): Array<[string, Stored]> {
  return [...store.entries()].filter(([key]) => key.startsWith(`${collectionName}/`));
}
