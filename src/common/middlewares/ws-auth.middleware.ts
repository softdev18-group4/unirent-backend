import { AuthService } from '@/auth/auth.service';
import { Socket } from 'socket.io';

type SocketIOMiddleWare = {
  (client: Socket, next: (err?: Error) => void);
};

export const SocketAuthMiddleware = (
  authService: AuthService,
): SocketIOMiddleWare => {
  return (client, next) => {
    try {
      const token = client.handshake.auth.token;
      authService.verifyToken(token);
      next();
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  };
};
