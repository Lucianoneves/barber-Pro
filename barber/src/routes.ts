import express, { Router, Request, Response } from "express";
import { CreateUserController } from "./controller/user/CreateUserController";
import { AuthUserController } from "./controller/user/AuthUserController";
import { DetailUserController } from "./controller/user/DetailUSerController";
import { UpdateUserController } from "./controller/user/UpdateUserController";

import { CreateHaircutController } from "./controller/haircut/CreateHaircutController";
import { ListHaircutsController } from "./controller/haircut/ListHaircutsController";
import { UpdateHaircutController } from "./controller/haircut/UpdateHaircutController";

import { CreateSubscriptionController } from "./controller/subscription/CreateSubscriptionController";
import { ConfirmSubscriptionController } from "./controller/subscription/ConfirmSubscriptionController";

import { CheckSubscriptionController } from "./controller/haircut/CheckSubscriptionController";
import { CountHaircutController } from "./controller/haircut/CountHaircutController";
import { DetailHaircutController } from "./controller/haircut/DetailHaircutController";

import { NewScheduleController } from "./controller/schedule/NewScheduleController";
import { ListScheduleController } from "./controller/schedule/ListScheduleController";
import { FinisScheduleController } from "./controller/schedule/FinisScheduleController";
import { ListAvailableSlotsController } from "./controller/schedule/ListAvailableSlotsController";
import { ListCustomersController } from "./controller/customer/ListCustomersController";
import { ListBusinessHoursController } from "./controller/hours/ListBusinessHoursController";
import { UpdateBusinessHoursController } from "./controller/hours/UpdateBusinessHoursController";
import { ListPublicShopsController } from "./controller/public/ListPublicShopsController";
import { DetailPublicShopController } from "./controller/public/DetailPublicShopController";
import { ListPublicSlotsController } from "./controller/public/ListPublicSlotsController";
import { LookupPublicCustomerController } from "./controller/public/LookupPublicCustomerController";
import { CreatePublicScheduleController } from "./controller/public/CreatePublicScheduleController";
import { UpdatePublicScheduleController } from "./controller/public/UpdatePublicScheduleController";
import { CancelPublicScheduleController } from "./controller/public/CancelPublicScheduleController";

import { isAuthenticated } from "./middlewares/isAuthenticated";
import { WebhooksController } from "./controller/subscription/WbhooksController";

import { CreatePortalController } from "./controller/subscription/CreatePortalController";

const router = Router();

router.post("/users", new CreateUserController().handle); // rota para criar um usuario
router.post("/sessions", new AuthUserController().handle); // rota para autenticar um usuario
router.get("/me", isAuthenticated, new DetailUserController().handle); // rota para detalhar um usuario
router.put("/users", isAuthenticated, new UpdateUserController().handle); // rota para atualizar um usuario

// rota de  cortes
router.post("/haircuts", isAuthenticated, new CreateHaircutController().handle); // rota para criar um corte
router.get("/haircuts", isAuthenticated, new ListHaircutsController().handle); // rota para listar todos os cortes
router.put("/haircuts", isAuthenticated, new UpdateHaircutController().handle); // rota para atualizar um corte
router.get(
  "/haircut/check",
  isAuthenticated,
  new CheckSubscriptionController().handle
); // rota para verificar se o usuario tem uma assinatura
router.get(
  "/haircut/count",
  isAuthenticated,
  new CountHaircutController().handle
); // rota para contar os cortes do usuario
router.get(
  "/haircut/detail",
  isAuthenticated,
  new DetailHaircutController().handle
); // rota para detalhar um corte

// rota de assinaturas pagamentos
router.post(
  "/subscriptions",
  isAuthenticated,
  new CreateSubscriptionController().handle
);
router.post(
  "/subscriptions/confirm",
  isAuthenticated,
  new ConfirmSubscriptionController().handle
);
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  new WebhooksController().handle
);
router.post(
  "/create-portal",
  isAuthenticated,
  new CreatePortalController().handle
);

// rota de agendamentos
router.post("/schedules", isAuthenticated, new NewScheduleController().handle); // criar agendamento
router.get("/schedules", isAuthenticated, new ListScheduleController().handle); // listar agendamentos
router.get(
  "/schedules/slots",
  isAuthenticated,
  new ListAvailableSlotsController().handle
);
router.delete(
  "/schedules",
  isAuthenticated,
  new FinisScheduleController().handle
); // finalizar agendamento

router.get(
  "/customers",
  isAuthenticated,
  new ListCustomersController().handle
);
router.get(
  "/business-hours",
  isAuthenticated,
  new ListBusinessHoursController().handle
);
router.put(
  "/business-hours",
  isAuthenticated,
  new UpdateBusinessHoursController().handle
);

router.get("/public/shops", new ListPublicShopsController().handle);
router.get(
  "/public/shops/:slug/slots",
  new ListPublicSlotsController().handle
);
router.get(
  "/public/shops/:slug/customer",
  new LookupPublicCustomerController().handle
);
router.get("/public/shops/:slug", new DetailPublicShopController().handle);
router.post("/public/schedules", new CreatePublicScheduleController().handle);
router.put("/public/schedules", new UpdatePublicScheduleController().handle);
router.delete(
  "/public/schedules",
  new CancelPublicScheduleController().handle
);

export default router;
