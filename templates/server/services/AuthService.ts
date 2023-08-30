import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY, HOSTED_ON } from '../envConfig';
import { CommonTypes } from 'common';
import { NextFunction, Response, Request, CookieOptions } from 'express';
import { PasswordAuthModel } from '../models/PasswordAuthModel';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXP = '7h';
const REFRESH_TOKEN_EXP = '7d';
export const REFRESH_TOKEN_KEY = 'app_refresh_token';

export class AuthService {
  static generateAccessToken(user: CommonTypes.User): string {
    return jwt.sign({ user }, JWT_SECRET_KEY, { expiresIn: ACCESS_TOKEN_EXP });
  }

  static generateRefreshToken(user: CommonTypes.User): string {
    return jwt.sign({ user }, JWT_SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXP });
  }

  static verifyToken(token: string): any {
    return jwt.verify(token, JWT_SECRET_KEY);
  }

  static makeRefreshCookieProps(expires?: Date): CookieOptions {
    return {
      secure: true,
      httpOnly: true,
      sameSite: 'lax',
      domain: HOSTED_ON,
      expires: expires ? expires : new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    };
  }

  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (err) {
      // Handle error appropriately here
      throw new Error('Error while hashing the password');
    }
  }

  static async checkPassword(userId: string, password: string): Promise<boolean> {
    try {
      const passwordAuth = await PasswordAuthModel.findOne({ userId }).exec();
      if (!passwordAuth) return false;

      const match = await bcrypt.compare(password, passwordAuth.passwordHash);
      return match;
    } catch (err) {
      throw new Error('Error while checking the password');
    }
  }

  static authMiddleware(req: Request, res: Response, next: NextFunction): void {
    // Get access token, remember to strip Bearer from start of accessToken
    const accessToken = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    const refreshToken = req.cookies && req.cookies[REFRESH_TOKEN_KEY];

    if (!accessToken && !refreshToken) {
      res.status(401).send('Access Denied. No token provided.');
      return;
    }

    try {
      // If we have an access token, we can just verify it and move on
      // Strip Bearer from start of accessToken
      if (!accessToken) {
        throw new Error('No access token');
      }
      const decoded = jwt.verify(accessToken, JWT_SECRET_KEY);
      // We set the user on the request object so that we can use it for the rest of the request
      res.locals.user = (<any>decoded).user;
      next();
      return;
    } catch (error) {
      if (!refreshToken) {
        res.status(401).send('Access Denied. No refresh token provided.');
        return;
      }

      try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET_KEY);
        const accessToken = jwt.sign({ user: (<any>decoded).user }, JWT_SECRET_KEY, {
          expiresIn: ACCESS_TOKEN_EXP,
        });

        res.cookie(REFRESH_TOKEN_KEY, refreshToken, this.makeRefreshCookieProps()).header('Authorization', accessToken);
        res.locals.user = (<any>decoded).user;
        next();
        return;
      } catch (error) {
        res.status(400).send('Invalid Token.');
        return;
      }
    }
  }
}
