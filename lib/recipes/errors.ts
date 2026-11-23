export type SearchErrorCode = "SEARCH_FAILED" | "SEARCH_TIMEOUT" | "SEARCH_UNAVAILABLE" |
  "INVALID_REQUEST" | "UNSUPPORTED_MEDIA_TYPE" | "REQUEST_TOO_LARGE" | "FORBIDDEN_ORIGIN" | "SEARCH_BUSY";

export class SearchError extends Error {
  constructor(public readonly code: SearchErrorCode) {
    super(code);
    this.name = "SearchError";
  }
}
