import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const port = 3000;

type LaserDisc = {
  id: number;
  filName: string;
  region: string;
  lengthMinutes: number;
  videoFormat: "NTSC" | "PAL";
  rotationType: "CAV" | "CLV";
};

let disco: LaserDisc[] = [
  { id: 1, filName: "Titanic", region: "EEUU", lengthMinutes: 182, videoFormat: "NTSC", rotationType: "CAV"  },
  { id: 2, filName: "La bella y la bestia", region: "EEUU", lengthMinutes: 161, videoFormat: "PAL", rotationType: "CLV" },
];

app.get("/disco", (_req, res) => {
  res.json(disco);
});


app.get("/disco/:id", (req, res) => {
  const id = Number(req.params.id);
  const discos = disco.find((t) => t.id === id);
  if (!disco) return res.status(404).json({ message: "Disco no encontrado" });
  res.json(disco);
});



app.post("/disco", (req, res) => {
  const { filName, region, lengthMinutes, videoFormat, rotationType } = req.body;
  const newDisco: LaserDisc = { id: Date.now(), filName, region, lengthMinutes, videoFormat, rotationType };
  disco.push(newDisco);
  res.status(201).json(newDisco);
});




app.delete("/disco/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = disco.findIndex((t) => t.id === id);
  if (index === -1)
    return res.status(404).json({ message: "Disco no encontrado" });
  disco.splice(index, 1);
  res.json({ message: "Disco eliminado" });
});

app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
  setTimeout(testApi, 1000);
});


async function testApi() {
  try {
    console.log("=== GET inicial ===");
    let res = await axios.get(`http://localhost:${port}/disco`);
    console.log(res.data);

    console.log("=== POST nuevo equipo ===");
    const nuevo = { filName: "Titanic", region: "EEUU", lengthMinutes: 182, videoFormat: "NTSC", rotationType: "CAV" };
    res = await axios.post(`http://localhost:${port}/disco`, nuevo);
    console.log(res.data);

    console.log("=== GET después del POST ===");
    res = await axios.get(`http://localhost:${port}/disco`);
    console.log(res.data);

    console.log("=== DELETE del nuevo equipo ===");
    await axios.delete(`http://localhost:${port}/disco/${res.data.at(-1).id}`);

    console.log("=== GET final ===");
    res = await axios.get(`http://localhost:${port}/disco`);
    console.log(res.data);

    console.log(" Cliente Axios completado correctamente");
  } catch (err) {
    console.error("Error en testApi:", err);
  }
}
