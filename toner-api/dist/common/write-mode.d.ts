export type WriteMode = 'create' | 'update';
export declare function field<In, Out>(mode: WriteMode, value: In | undefined, map: (value: In) => Out, fallback: Out): Out | undefined;
export declare function asIs<T>(value: T): T;
