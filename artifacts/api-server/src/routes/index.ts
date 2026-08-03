import { Router, type IRouter } from "express";
import healthRouter from "./health";
import applicationsRouter from "./applications";
import performersRouter from "./performers";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(applicationsRouter);
router.use(performersRouter);
router.use(adminRouter);

export default router;
