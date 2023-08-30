import * as env from 'env-var';

export const NODE_ENV = env.get('NODE_ENV').default('development').asString();
export const JWT_SECRET_KEY = env.get('JWT_SECRET_KEY').required().asString();
export const EXPRESS_PORT = env.get('EXPRESS_PORT').default('3200').asPortNumber();
export const HOSTED_ON = env.get('HOSTED_ON').default('localhost').asString();
export const POSTGRES_HOST = env.get('POSTGRES_HOST').required().asString();
export const POSTGRES_PORT = env.get('POSTGRES_PORT').required().asPortNumber();
export const POSTGRES_USER = env.get('POSTGRES_USER').required().asString();
export const POSTGRES_PASSWORD = env.get('POSTGRES_PASSWORD').required().asString();
export const POSTGRES_DB = env.get('POSTGRES_DB').required().asString();
