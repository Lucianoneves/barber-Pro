import { Request, Response } from "express";
import { ListScheduleService } from "../../service/schedule/ListScheduleService";

class ListScheduleController {
  async handle(req: Request, res: Response) {
    // controller para listar os agendamentos
    const user_id = req.user_id;

    const listSchedule = new ListScheduleService(); // serviço para listar os agendamentos

    const schedules = await listSchedule.execute({ user_id }); // executa o serviço
    return res.json(schedules);
  }
}

export { ListScheduleController };
