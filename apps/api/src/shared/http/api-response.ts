export type ApiSuccessResponse<T> = {
  data: T;
};

export type ApiListResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    data,
  };
}

export function listResponse<T>(data: T[], meta: ApiListResponse<T>["meta"]): ApiListResponse<T> {
  return {
    data,
    meta,
  };
}
