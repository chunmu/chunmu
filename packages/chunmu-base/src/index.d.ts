export interface FileSizeUnitNSMap {
  [key: number]: string
}

export interface FileSizeUnitSNMap {
  [key: string]: number
}

export interface FileSizeFormatParams {
  value: number,
  rest: number,
  unitNSMap: FileSizeUnitNSMap,
  unitSNMap: FileSizeUnitSNMap,
  index: number
}

export interface FileSizeParams {
  value: number,
  keepRest: boolean,
  format?: (params: FileSizeFormatParams) => string
}

export type UnnormalNumberParams = number | null | undefined;
export type UnnormalNumberResponse = number | null | undefined | string;

export interface MoneyCommaParams {
  value: UnnormalNumberParams,
  dig: number,
  precision: number,
}

// eslint-disable-next-line
export function kConst (_: any): any;

// eslint-disable-next-line
export function kFunc (_: any): any;

// eslint-disable-next-line
export function kTrue (_: any): boolean;

// eslint-disable-next-line
export function kFalse (_: any): boolean;

export function kNoop (): void;

// eslint-disable-next-line
export function once (_: any): void;

export function formatFileSize(params: FileSizeParams): string;

// eslint-disable-next-line
export function isDefine (v: any): boolean;
// eslint-disable-next-line
export function isUndefine (v: any): boolean;
// eslint-disable-next-line
export function isFunc (f: any): boolean;
// eslint-disable-next-line
export function isString (f: any): boolean;
// eslint-disable-next-line
export function isObject (obj: any): boolean;
// eslint-disable-next-line
export function isPromise (p: any): boolean;
// eslint-disable-next-line
export function isIterator (it: any): boolean;
// eslint-disable-next-line
export function isIterable (it: any): boolean ;