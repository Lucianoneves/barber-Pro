import { Request, Response } from "express";
import { LookupPublicCustomerService } from "../../service/public/LookupPublicCustomerService";

class LookupPublicCustomerController {
  async handle(req: Request, res: Response) {
    const { slug } = req.params;
    const phone = String(req.query.phone || "");
    const customer = await new LookupPublicCustomerService().execute({
      slug,
      phone,
    });
    return res.json(customer);
  }
}

export { LookupPublicCustomerController };
