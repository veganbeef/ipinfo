import { IKinesisRecord, ILogEntry } from './interfaces';

class Logger {
  private readonly appVersion: string;
  private readonly appEnvironment: string;

  constructor() {
    this.appVersion = process.env.APP_VERSION!;
    this.appEnvironment = process.env.APP_ENVIRONMENT!;
  }

  /**
   * Standardized method to handle all error logging for the entire app.
   * If the optional "error" field is included in the ILogEntry input, the log is treated as an error log.
   * Otherwise, the log is treated as an info log.
   * @param {ILogEntry} log
   * @returns {void}
   */
  public addLog(log: ILogEntry): void {
    const result = log.error ? 'Error' : 'Success';
    const record: IKinesisRecord = {
      ...log,
      result,
      version: this.appVersion,
      environment: this.appEnvironment
    };
    // connect to Kinesis or some actual logging service
    console.log(record);
  }
}

export const logger = new Logger();