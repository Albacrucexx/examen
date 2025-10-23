import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

//Enunciado: El servidor debe ejecutarse en el puerto 3000.
const port = 3000;

type Team = {
  id: number;
  name: string;
  city: string;
  titles: number;
};

//Los equipos estarán guardados en un array en memoria (no se usa base de datos).
let teams: Team[] = [
  { id: 1, name: "Lakers", city: "Los Angeles", titles: 17 },
  { id: 2, name: "Celtics", city: "Boston", titles: 17 },
];

//“cuando alguien haga una petición GET a /teams, ejecuta esto”.
// (_req, res) => { ... }:
//El primer parámetro _req no se usa (por eso el guion bajo _),
//el segundo, res, se usa para responder al cliente.
//res.json(teams):
// convierte el array de objetos teams a formato JSON y lo envía como respuesta HTTP.

app.get("/teams", (_req, res) => {
  res.json(teams);
});



/*Busca un solo equipo por su id dentro del array.
Ejemplo: si haces GET /teams/1, devuelve solo el equipo con id = 1.
req.params.id es texto, así que se convierte a número para poder comparar correctamente (===).
const team = teams.find((t) => t.id === id);
→ recorre el array teams y devuelve el primer elemento cuyo id coincida.
Si no lo encuentra, devuelve undefined.
if (!team) return res.status(404).json({ message: "Equipo no encontrado" });
→ si team es undefined, devuelve un error HTTP 404 (recurso no encontrado).
.status(404) cambia el código de respuesta y .json() envía el mensaje de error.

res.json(team);
→ si lo encontró, responde con el objeto completo del equipo.


*/
app.get("/teams/:id", (req, res) => {
  const id = Number(req.params.id);
  const team = teams.find((t) => t.id === id);
  if (!team) return res.status(404).json({ message: "Equipo no encontrado" });
  res.json(team);
});


/* Permite añadir un nuevo equipo al array, recibiendo los datos desde el cliente (por ejemplo desde Postman o Axios).
app.post("/teams", ...): → define una ruta para peticiones POST (crear recursos nuevos).
const { name, city, titles } = req.body; → extrae los datos enviados en el cuerpo de la petición (debe ser JSON).
Por eso usamos antes app.use(express.json()): para poder leer req.body.
const newTeam: Team = { id: Date.now(), name, city, titles };
→ crea un nuevo objeto siguiendo la estructura del tipo Team.
Date.now() genera un ID numérico único basado en el tiempo actual.
teams.push(newTeam); → añade el nuevo equipo al array existente.
res.status(201).json(newTeam); → responde al cliente con el nuevo equipo creado y un código HTTP 201 (Created).
*/

app.post("/teams", (req, res) => {
  const { name, city, titles } = req.body;
  const newTeam: Team = { id: Date.now(), name, city, titles };
  teams.push(newTeam);
  res.status(201).json(newTeam);
});


/*Elimina del array el equipo cuyo id se envía en la URL.
Ejemplo: DELETE /teams/2 → borra los Celtics.
app.delete("/teams/:id", ...): → define un endpoint para eliminar recursos.
const id = Number(req.params.id);→ convierte el parámetro id a número.
const index = teams.findIndex((t) => t.id === id);
→ busca la posición del equipo dentro del array (índice del elemento).
if (index === -1) → significa que no existe un equipo con ese ID.
Devuelve error 404 y un mensaje "Equipo no encontrado".
teams.splice(index, 1);→ elimina 1 elemento en la posición index.
res.json({ message: "Equipo eliminado" }); → responde al cliente confirmando la eliminación.
*/


app.delete("/teams/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = teams.findIndex((t) => t.id === id);
  if (index === -1)
    return res.status(404).json({ message: "Equipo no encontrado" });
  teams.splice(index, 1);
  res.json({ message: "Equipo eliminado" });
});


/* orden para poner en marcha el servidor.
setTimeout retrasa la ejecución de algo (una función) un cierto tiempo, expresado en milisegundos.

Aquí espera 1 segundo (1000 ms) antes de ejecutar testApi().
*/

app.listen(port, () => {
  console.log(`Servidor en http://localhost:${port}`);
  setTimeout(testApi, 1000);
});


/* Es async porque vamos a usar await, que sirve para esperar a que terminen las peticiones axios antes 
de pasar a la siguiente. Axios devuelve promises y usar async/await hace que
el codigo se lea de forma secuencial
*/

async function testApi() {
  try {
    /*
    Envía una petición GET al servidor que acabamos de crear (localhost:3000/teams).
El servidor responde con el array inicial de equipos (Lakers, Celtics).
await espera a que llegue la respuesta antes de continuar.
res.data contiene los datos devueltos por el servidor (el JSON).
    */
    console.log("=== GET inicial ===");
    let res = await axios.get(`http://localhost:${port}/teams`);
    console.log(res.data);

/*
Crea un nuevo objeto con los datos del equipo Bulls.
Envía una petición POST al servidor (/teams) con ese objeto como body.
El servidor lo recibe, genera un nuevo id con Date.now() y lo guarda en el array.
La respuesta (res.data) contiene el nuevo equipo que se acaba de crear.
*/

    console.log("=== POST nuevo equipo ===");
    const nuevo = { name: "Bulls", city: "Chicago", titles: 6 };
    res = await axios.post(`http://localhost:${port}/teams`, nuevo);
    console.log(res.data);

/*
Llama otra vez a la ruta GET /teams.
Ahora el servidor devuelve el array con tres equipos (los dos iniciales + Bulls).
Sirve para comprobar que el POST realmente funcionó.
*/


    console.log("=== GET después del POST ===");
    res = await axios.get(`http://localhost:${port}/teams`);
    console.log(res.data);

/*
Usa .at(-1) → para obtener el último elemento del array (Bulls).
Luego hace una petición DELETE a la API para eliminarlo por su id.
El servidor lo busca, lo borra y responde con:
*/

    console.log("=== DELETE del nuevo equipo ===");
    await axios.delete(`http://localhost:${port}/teams/${res.data.at(-1).id}`);
/*
Vuelve a pedir la lista completa tras el DELETE.
Ya solo quedan los equipos originales (Lakers y Celtics).
Demuestra que el DELETE ha funcionado.
*/
    console.log("=== GET final ===");
    res = await axios.get(`http://localhost:${port}/teams`);
    console.log(res.data);

    console.log(" Cliente Axios completado correctamente");
  } catch (err) {
    console.error("Error en testApi:", err);
  }
}
