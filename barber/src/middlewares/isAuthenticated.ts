import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

interface Payload {
  sub: string;
  role?: string;
}

export function isAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authToken = request.headers.authorization;

  if (!authToken) {
    return response.status(401).end();
  }

  const [, token] = authToken.split(" ");

  try {
    const { sub, role } = verify(token, process.env.JWT_SECRET) as Payload;

    if (role === "customer") {
      return response.status(401).end();
    }

    request.user_id = sub;

    return next();
  } catch {
    return response.status(401).end();
  }
}
