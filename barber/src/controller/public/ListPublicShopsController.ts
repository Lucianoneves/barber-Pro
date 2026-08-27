import { Request, Response } from "express";
import { ListPublicShopsService } from "../../service/public/ListPublicShopsService";

class ListPublicShopsController {
  async handle(req: Request, res: Response) {
    const shops = await new ListPublicShopsService().execute();
    return res.json(shops);
  }
}

export { ListPublicShopsController };
