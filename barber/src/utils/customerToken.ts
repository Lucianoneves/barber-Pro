import { sign, verify } from "jsonwebtoken";

export const CUSTOMER_TOKEN_ROLE = "customer";

interface CustomerTokenInput {
  customer_id: string;
  shop_id: string;
  slug: string;
}

interface CustomerTokenPayload {
  sub: string;
  role: string;
  shop_id: string;
  slug: string;
}

export function signCustomerToken({
  customer_id,
  shop_id,
  slug,
}: CustomerTokenInput) {
  return sign(
    {
      role: CUSTOMER_TOKEN_ROLE,
      shop_id,
      slug,
    },
    process.env.JWT_SECRET as string,
    {
      subject: customer_id,
      expiresIn: "30d",
    }
  );
}

export function verifyCustomerToken(token: string) {
  const payload = verify(
    token,
    process.env.JWT_SECRET as string
  ) as CustomerTokenPayload;

  if (payload.role !== CUSTOMER_TOKEN_ROLE || !payload.sub || !payload.shop_id) {
    throw new Error("Acesso do cliente inválido");
  }

  return {
    customer_id: payload.sub,
    shop_id: payload.shop_id,
    slug: payload.slug,
  };
}
