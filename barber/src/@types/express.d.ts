declare namespace Express {
  export interface Request {
    user_id: string;
    customer_id: string;
    customer_shop_id: string;
    customer_slug: string;
  }
}
