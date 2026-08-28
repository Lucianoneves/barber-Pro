import { Request, Response } from "express";
import { CancelPublicScheduleService } from "../../service/public/CancelPublicScheduleService";

class CancelPublicScheduleController {
  async handle(req: Request, res: Response) {
    const { schedule_id, slug } = req.body;

    if (slug && slug !== req.customer_slug) {
      return res.status(401).json({
        error: "Acesso do cliente inválido nesta barbearia",
      });
    }

    const result = await new CancelPublicScheduleService().execute({
      shop_id: req.customer_shop_id,
      customer_id: req.customer_id,
      schedule_id,
    });
    return res.json(result);
  }
}

export { CancelPublicScheduleController };
