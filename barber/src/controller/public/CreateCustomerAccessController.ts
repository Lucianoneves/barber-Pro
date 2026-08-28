import { Request, Response } from "express";
import { CreateCustomerAccessService } from "../../service/public/CreateCustomerAccessService";

class CreateCustomerAccessController {
  async handle(req: Request, res: Response) {
    const { slug, phone } = req.body;
    const access = await new CreateCustomerAccessService().execute({
      slug,
      phone,
    });
    return res.json(access);
  }
}

export { CreateCustomerAccessController };
