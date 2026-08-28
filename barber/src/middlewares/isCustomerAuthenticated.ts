import { NextFunction, Request, Response } from "express";
import { verifyCustomerToken } from "../utils/customerToken";

export function isCustomerAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const header = request.headers["x-customer-token"];
  const token = Array.isArray(header) ? header[0] : header;

  if (!token) {
    return response.status(401).json({
      error: "Acesse seus horários com o telefone",
    });
  }

  try {
    const customer = verifyCustomerToken(token);

    request.customer_id = customer.customer_id;
    request.customer_shop_id = customer.shop_id;
    request.customer_slug = customer.slug;

    return next();
  } catch {
    return response.status(401).json({
      error: "Acesso do cliente inválido",
    });
  }
}
