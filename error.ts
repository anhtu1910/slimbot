export interface ResponseError extends Error {
  status?: number;
}

export interface SystemError extends Error {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
  stack?: string;
}
