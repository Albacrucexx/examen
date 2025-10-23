import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const port = 3000;

type Team = {
  id: number;
  name: string;
  city: string;
  titles: number;
};

let teams: Team[] = [
  { id: 1, name: "Lakers", city: "Los Angeles", titles: 17 },
  { id: 2, name: "Celtics", city: "Boston", titles: 17 },
];

app.get("/teams", (_req, res) => {
  res.json(teams);
});

app.get("/teams/:id", (req, res) => {
  const id = Number(req.params.id);
  const team = teams.find((t) => t.id === id);
  if (!team) return res.status(404).json({ message: "Equipo no encontrado" });
  res.json(team);
});

app.post("/teams", (req, res) => {
  const { name, city, titles } = req.body;
  const newTeam: Team = { id: Date.now(), name, city, titles };
  teams.push(newTeam);
  res.status(201).json(newTeam);
});

app.delete("/teams/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = teams.findIndex((t) => t.id === id);
  if (index === -1)
    return res.status(404).json({ message: "Equipo no encontrado" });
  teams.splice(index, 1);
  res.json({ message: "Equipo eliminado" });
});

app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
  setTimeout(testApi, 1000);
});

async function testApi() {
  try {
    console.log("=== GET inicial ===");
    let res = await axios.get(`http://localhost:${port}/teams`);
    console.log(res.data);

    console.log("=== POST nuevo equipo ===");
    const nuevo = { name: "Bulls", city: "Chicago", titles: 6 };
    res = await axios.post(`http://localhost:${port}/teams`, nuevo);
    console.log(res.data);

    console.log("=== GET después del POST ===");
    res = await axios.get(`http://localhost:${port}/teams`);
    console.log(res.data);

    console.log("=== DELETE del nuevo equipo ===");
    await axios.delete(`http://localhost:${port}/teams/${res.data.at(-1).id}`);

    console.log("=== GET final ===");
    res = await axios.get(`http://localhost:${port}/teams`);
    console.log(res.data);

    console.log("✅ Cliente Axios completado correctamente");
  } catch (err) {
    console.error("Error en testApi:", err);
  }
}
