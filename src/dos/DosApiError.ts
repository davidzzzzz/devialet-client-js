export class DosApiError extends Error {
    constructor(message: string, cause: Error | null = null) {
        super(message);
        this.name = "DosApiError";
        this.cause = cause;
    }
}