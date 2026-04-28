import winston from 'winston';
import logger from '../utils/logger'; 

describe('logger configuration', () => {
  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have level set to info', () => {
    expect(logger.level).toBe('info');
  });

  it('should have two transports', () => {
    expect(logger.transports.length).toBe(2);
  });

  it('should contain Console transport', () => {
    const hasConsoleTransport = logger.transports.some(
      (transport) => transport instanceof winston.transports.Console
    );

    expect(hasConsoleTransport).toBe(true);
  });

  it('should contain File transport with app.log filename', () => {
    const fileTransport = logger.transports.find(
      (transport) => transport instanceof winston.transports.File
    ) as winston.transports.FileTransportInstance;

    expect(fileTransport).toBeDefined();
    expect(fileTransport.filename).toContain('app.log');
  });

  it('should log message without throwing error', () => {
    expect(() => {
      logger.info('Test log message');
    }).not.toThrow();
  });
});