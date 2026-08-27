import { Request, Response } from "express";
import { AuthUserService } from "../../service/user/AuthUserService";

class AuthUserController {
  // controller para autenticar um usuario
  async handle(request: Request, response: Response) {
    const { email, password } = request.body;

    const authUserService = new AuthUserService();

    const session = await authUserService.execute({
      email,
      password,
    });

    return response.json(session);
  }
}

export { AuthUserController };
