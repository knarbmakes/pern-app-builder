import express, { Request, Response, CookieOptions, NextFunction } from 'express';
import { AuthService, REFRESH_TOKEN_KEY } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { DataReply } from '../core/DataReply';
import { CommonTypes } from 'common';

const router = express.Router();

// Registration route
router.post('/register', async (req: Request, res: Response) => {
  console.debug('Registration request received');
  const user: Partial<CommonTypes.User> = req.body;
  const reply: DataReply<CommonTypes.User> = await UserService.create(user);

  if (reply.error) {
    return res.status(500).json({ error: reply.error });
  }

  return res.status(201).json({ data: reply.data });
});

router.get('/user', AuthService.authMiddleware, async (req: Request, res: Response) => {
  console.debug('User request received');
  const { user } = res.locals;
  const reply = await UserService.get(user.id);

  if (reply.error) {
    return res.status(500).json({ error: reply.error });
  }

  return res.status(200).json({ data: reply.data });
});

// Login route
router.post('/login', async (req: Request, res: Response) => {
  console.debug('Login request received');
  const { username, passwordHash } = req.body;

  // TODO: Sort out password hashing and comparison logic.
  // This demo app just assumes the password is correct and continues.
  const reply = await UserService.getByQuery({ username });

  if (reply.error || !reply.data) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const accessToken = AuthService.generateAccessToken(reply.data);
  const refreshToken = AuthService.generateRefreshToken(reply.data);

  return res
    .cookie(REFRESH_TOKEN_KEY, refreshToken, AuthService.makeRefreshCookieProps())
    .header('Authorization', `Bearer ${accessToken}`)
    .json({ data: reply.data });
});

// Refresh route
router.post('/refresh', async (req: Request, res: Response) => {
  console.debug('Refresh request received');
  const refreshToken = req.cookies[REFRESH_TOKEN_KEY];

  if (!refreshToken) {
    return res.status(401).json({ error: 'Access Denied. No refresh token provided.' });
  }

  try {
    const decoded: any = AuthService.verifyToken(refreshToken);
    const reply: DataReply<string> = await UserService.refresh(decoded.player);

    if (reply.error) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    res
      .cookie(REFRESH_TOKEN_KEY, refreshToken, AuthService.makeRefreshCookieProps())
      .header('Authorization', `Bearer ${reply.data}`)
      .json({ data: decoded.player });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router;
