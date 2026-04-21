export interface ApiPaginationInfo {
  readonly count: number;
  readonly pages: number;
  readonly next: string | null;
  readonly prev: string | null;
}

export interface ApiListResponse<T> {
  readonly info: ApiPaginationInfo;
  readonly results: ReadonlyArray<T>;
}
