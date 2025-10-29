/**
 * Logger Service
 * Centralized logging for errors, warnings, and info messages
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  error?: Error;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  /**
   * Log debug message (only in development)
   */
  debug(message: string, data?: any): void {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, data);
      this.addLog('debug', message, data);
    }
  }

  /**
   * Log info message
   */
  info(message: string, data?: any): void {
    console.log(`[INFO] ${message}`, data);
    this.addLog('info', message, data);
  }

  /**
   * Log warning message
   */
  warn(message: string, data?: any): void {
    console.warn(`[WARN] ${message}`, data);
    this.addLog('warn', message, data);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | any, data?: any): void {
    console.error(`[ERROR] ${message}`, error, data);
    this.addLog('error', message, data, error);

    // TODO: Send to error reporting service (e.g., Sentry)
    // if (!__DEV__) {
    //   Sentry.captureException(error, {
    //     extra: { message, data },
    //   });
    // }
  }

  /**
   * Add log entry to memory
   */
  private addLog(level: LogLevel, message: string, data?: any, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      error,
    };

    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs as JSON string
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Export singleton instance
let loggerInstance: LoggerService | null = null;

export function getLogger(): LoggerService {
  if (!loggerInstance) {
    loggerInstance = new LoggerService();
  }
  return loggerInstance;
}

// Export convenience functions
export const logger = {
  debug: (message: string, data?: any) => getLogger().debug(message, data),
  info: (message: string, data?: any) => getLogger().info(message, data),
  warn: (message: string, data?: any) => getLogger().warn(message, data),
  error: (message: string, error?: Error | any, data?: any) =>
    getLogger().error(message, error, data),
  getLogs: () => getLogger().getLogs(),
  getLogsByLevel: (level: LogLevel) => getLogger().getLogsByLevel(level),
  clearLogs: () => getLogger().clearLogs(),
  exportLogs: () => getLogger().exportLogs(),
};
