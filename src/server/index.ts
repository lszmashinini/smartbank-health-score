import "dotenv/config";
import { createExpressApp } from "./express";

const port = Number(process.env.PORT ?? 4000);
const app = createExpressApp();

app.listen(port, () => {
  console.log(`SmartBank Financial Health Score™ Express API running on http://localhost:${port}`);
});
