import { HttpParams } from '@angular/common/http';

export type QueryParamValue = string | number | boolean | ReadonlyArray<string | number | boolean> | null | undefined;

export type QueryParams = Readonly<Record<string, QueryParamValue>>;

export function toHttpParams(params?: QueryParams): HttpParams {
  let httpParams = new HttpParams();

  if (!params) {
    return httpParams;
  }

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        httpParams = httpParams.append(key, String(item));
      }
      continue;
    }

    httpParams = httpParams.set(key, String(value));
  }

  return httpParams;
}
