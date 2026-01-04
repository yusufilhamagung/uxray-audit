export class BadOutputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadOutputError';
  }
}

export class AnalyzerTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnalyzerTimeoutError';
  }
}

export class AnalyzerRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnalyzerRequestError';
  }
}
