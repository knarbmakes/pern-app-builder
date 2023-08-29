import jwt from 'jsonwebtoken';
import { JWT_SECRET_KEY, HOSTED_ON } from '../envConfig';
import { CommonTypes } from 'common';
import { NextFunction, Response, Request, CookieOptions } from 'express';

const ACCESS_TOKEN_EXP = '7h';
const REFRESH_TOKEN_EXP = '7d';
export const REFRESH_TOKEN_KEY = 'rtk_ff_id';

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
      // We set the player on the request object so that we can use it for the rest of the request
      res.locals.player = (<any>decoded).player;
      next();
      return;
    } catch (error) {
      if (!refreshToken) {
        res.status(401).send('Access Denied. No refresh token provided.');
        return;
      }

      try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET_KEY);
        const accessToken = jwt.sign({ player: (<any>decoded).player }, JWT_SECRET_KEY, {
          expiresIn: ACCESS_TOKEN_EXP,
        });

        res.cookie(REFRESH_TOKEN_KEY, refreshToken, this.makeRefreshCookieProps()).header('Authorization', accessToken);
        res.locals.player = (<any>decoded).player;
        next();
        return;
      } catch (error) {
        res.status(400).send('Invalid Token.');
        return;
      }
    }
  }
}
