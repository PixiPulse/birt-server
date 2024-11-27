import { app } from "./app";

const PORT = 5001;

app.listen(PORT, () => {
  console.log("🚀 Server ready at: http://localhost:" + PORT);
});
