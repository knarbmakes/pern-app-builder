import * as env from 'env-var';

export const NODE_ENV = env.get('NODE_ENV').default('development').asString();
export const MONGODB_URI = env.get('MONGODB_URI').required().asString();
export const JWT_SECRET_KEY = env.get('JWT_SECRET_KEY').required().asString();
export const EXPRESS_PORT = env.get('EXPRESS_PORT').default('3200').asPortNumber();
export const HOSTED_ON = env.get('HOSTED_ON').default('localhost').asString();
