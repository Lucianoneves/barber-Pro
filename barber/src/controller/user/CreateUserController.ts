import { Request, Response } from "express";
import { CreateUserService } from "../../service/user/createUserService";

class CreateUserController {
  async handle(req: Request, res: Response) {
    const { name, email, password, endereco } = req.body;

    const cretaeUserService = new CreateUserService();

    const user = await cretaeUserService.execute({
      // passando os dados para o service
      name,
      email,
      password,
      endereco,
    });

    return res.json(user);
  }
}

export { CreateUserController };
