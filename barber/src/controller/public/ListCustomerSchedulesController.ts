import { Request, Response } from "express";
import { ListOwnPublicSchedulesService } from "../../service/public/ListOwnPublicSchedulesService";

class ListCustomerSchedulesController {
  async handle(req: Request, res: Response) {
    const { customer_id, customer_shop_id, customer_slug } = req;
    const slug = String(req.query.slug || "");

    if (slug && slug !== customer_slug) {
      return res.status(401).json({
        error: "Acesso do cliente inválido nesta barbearia",
      });
    }

    const schedules = await new ListOwnPublicSchedulesService().execute({
      customer_id,
      shop_id: customer_shop_id,
    });

    return res.json({
      schedules,
    });
  }
}

export { ListCustomerSchedulesController };
