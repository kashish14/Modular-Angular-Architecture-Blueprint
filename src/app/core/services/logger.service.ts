import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app.config';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private enableLogging = APP_CONFIG.enableLogging;

  constructor() {}

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, args);
  }

  error(message: string, error?: any, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, [error, ...args]);
  }

  private log(level: LogLevel, message: string, args: any[]): void {
    if (!this.enableLogging) {
      return;
    }

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logMessage, ...args);
        break;
      case LogLevel.INFO:
        console.info(logMessage, ...args);
        break;
      case LogLevel.WARN:
        console.warn(logMessage, ...args);
        break;
      case LogLevel.ERROR:
        console.error(logMessage, ...args);
        break;
    }
  }
}
