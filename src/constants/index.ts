export * from './routes';

export const DOMAIN =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4712'
    : 'http://localhost:4712';
