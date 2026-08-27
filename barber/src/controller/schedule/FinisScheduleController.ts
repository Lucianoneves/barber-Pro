import { Request, Response } from "express";
import { FinissSheduleService } from "../../service/schedule/FinissSheduleService";

class FinisScheduleController {
  async handle(req: Request, res: Response) {
    // controller para finalizar o agendamento
    const user_id = req.user_id;
    const schedule_id = (req.query.schedule_id ||
      req.query.scheduleId) as string;

    const finisSchedule = new FinissSheduleService(); // serviço para finalizar o agendamento

    const schedule = await finisSchedule.execute({ schedule_id, user_id }); // executa o serviço
    return res.json(schedule);
  }
}

export { FinisScheduleController };
