import { Request, Response } from "express";
import { DetailPublicShopService } from "../../service/public/DetailPublicShopService";

class DetailPublicShopController {
  async handle(req: Request, res: Response) {
    const { slug } = req.params;
    const shop = await new DetailPublicShopService().execute({ slug });
    return res.json(shop);
  }
}

export { DetailPublicShopController };
