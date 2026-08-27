import { Request, Response } from "express";
import { UpdateService } from "../../service/user/UpdateService";

class UpdateUserController {
  async handle(request: Request, response: Response) {
    // controller para atualizar o usuario

    const { name, endereco } = request.body;
    const user_id = request.user_id;

    const updateService = new UpdateService();

    const user = await updateService.execute({
      // executa o serviço de atualização do usuario
      user_id,
      name,
      endereco,
    });

    return response.json(user);
  }
}

export { UpdateUserController };
