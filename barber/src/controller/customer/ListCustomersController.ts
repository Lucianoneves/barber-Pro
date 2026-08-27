import { Request, Response } from "express";
import { ListCustomersService } from "../../service/customer/ListCustomersService";

class ListCustomersController {
  async handle(req: Request, res: Response) {
    const user_id = req.user_id;
    const listCustomers = new ListCustomersService();
    const customers = await listCustomers.execute({ user_id });

    return res.json(customers);
  }
}

export { ListCustomersController };
