import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY, HOSTED_ON } from '../envConfig';
import { CommonTypes } from 'common';
import { NextFunction, Response, Request, CookieOptions } from 'express';
import { PasswordAuthModel } from '../models/PasswordAuthModel';
import * as bcrypt from 'bcrypt';
import { logger } from '../core/logger';

// Constants
const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXP = '7h';
const REFRESH_TOKEN_EXP = '7d';
export const REFRESH_TOKEN_KEY = 'app_refresh_token';

export class AuthService {
  // Generate tokens
  static generateToken(user: CommonTypes.User, type: 'access' | 'refresh'): string {
    const expiresIn = type === 'access' ? ACCESS_TOKEN_EXP : REFRESH_TOKEN_EXP;
    return jwt.sign({ user }, JWT_SECRET_KEY, { expiresIn });
  }

  // Verify JWT token and log errors
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET_KEY);
    } catch (err) {
      logger.error(`Error verifying ${token.substr(0, 10)}... token: ${err}`);
      throw new Error('Invalid token');
    }
  }

  // Cookie properties for refresh token
  static makeRefreshCookieProps(expires?: Date): CookieOptions {
    return {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      domain: HOSTED_ON,
      expires: expires || new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    };
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  }

  // Check if the password is correct
  static async checkPassword(userId: string, password: string): Promise<boolean> {
    const passwordAuth = await PasswordAuthModel.findOne({ userId }).exec();
    return passwordAuth ? await bcrypt.compare(password, passwordAuth.passwordHash) : false;
  }

  // Handle token verification and user attachment to response
  static handleTokenAndUser(req: Request, res: Response, type: 'access' | 'refresh'): void {
    const token = type === 'access' ? req.headers['authorization']?.split(' ')[1] : req.cookies?.[REFRESH_TOKEN_KEY];
    if (!token) throw new Error(`No ${type} token`);
    const decoded = AuthService.verifyToken(token);
    res.locals.user = decoded.user;
    if (type === 'refresh') {
      const newAccessToken = AuthService.generateToken(decoded.user, 'access');
      res.header('Authorization', `Bearer ${newAccessToken}`);
    }
  }

  // Middleware for authentication
  static authMiddleware(req: Request, res: Response, next: NextFunction): void {
    try {
      AuthService.handleTokenAndUser(req, res, 'access');
      next();
    } catch (accessError) {
      try {
        AuthService.handleTokenAndUser(req, res, 'refresh');
        next();
      } catch (refreshError) {
        res.status(400).send('Invalid Token.');
      }
    }
  }
}
