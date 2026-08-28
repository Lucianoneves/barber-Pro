import { Request, Response } from "express";
import { CreateCustomerAccessService } from "../../service/public/CreateCustomerAccessService";

class CreateCustomerAccessController {
  async handle(req: Request, res: Response) {
    const { slug, phone, name } = req.body;
    const access = await new CreateCustomerAccessService().execute({
      slug,
      phone,
      name,
    });
    return res.json(access);
  }
}

export { CreateCustomerAccessController };
