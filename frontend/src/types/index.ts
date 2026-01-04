export type AnyFunction = (...args: any[]) => any
export type AsyncFunction<T extends AnyFunction> = (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>
