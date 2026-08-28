import { Request, Response } from "express";
import { UpdatePublicScheduleService } from "../../service/public/UpdatePublicScheduleService";

class UpdatePublicScheduleController {
  async handle(req: Request, res: Response) {
    const { schedule_id, haircut_id, scheduled_at, slug } = req.body;

    if (slug && slug !== req.customer_slug) {
      return res.status(401).json({
        error: "Acesso do cliente inválido nesta barbearia",
      });
    }

    const schedule = await new UpdatePublicScheduleService().execute({
      shop_id: req.customer_shop_id,
      slug: req.customer_slug,
      customer_id: req.customer_id,
      schedule_id,
      haircut_id,
      scheduled_at,
    });
    return res.json(schedule);
  }
}

export { UpdatePublicScheduleController };
