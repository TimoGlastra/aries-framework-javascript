import type { SingleOrArray } from './type';
export declare const asArray: <T>(val?: SingleOrArray<T>) => Array<T>;
type ExtractValueFromSingleOrArray<V> = V extends SingleOrArray<infer Value> ? Value : never;
export declare const mapSingleOrArray: <Wrapper extends SingleOrArray<unknown>, Return>(value: Wrapper, fn: (value: ExtractValueFromSingleOrArray<Wrapper>) => Return) => SingleOrArray<Return>;
export {};
