import { Router, type IRouter } from "express";
import healthRouter from "./health";
import linksRouter from "./links";
import shelvesRouter from "./shelves";

const router: IRouter = Router();

router.use(healthRouter);
router.use(linksRouter);
router.use(shelvesRouter);

export default router;
