const express = require("express");
const app = express();
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const { open } = sqlite;
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersSqlQuery = `SELECT * FROM cricket_team;`;
  const playersArrOfDbObjects = await db.all(getPlayersSqlQuery);
  const playersArrOfResponseObjects = playersArrOfDbObjects.map((eachDbObj) =>
    convertDbObjectToResponseObject(eachDbObj)
  );
  response.send(playersArrOfResponseObjects);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
    INSERT INTO 
        cricket_team(player_name, jersey_number, role)
    VALUES('${playerName}', ${jerseyNumber}, '${role}');
    `;
  const dbResponse = await db.run(addPlayerQuery); //dbResponse.lasID =(new)player_id - automated
  request.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerSqlQuery = `
    SELECT 
      * 
    FROM 
       cricket_team
    WHERE
      player_id = ${playerId};
      `;
  const playerObj = await db.get(getPlayerSqlQuery);
  const responseObj = convertDbObjectToResponseObject(playerObj);
  response.send(responseObj);
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
    UPDATE 
        cricket_team
    SET
        player_name = '${playerName}',
        jersey_number = ${jersey_number},
        role = '${role}'
    WHERE
        player_id = ${playerId}
    `;
  await db.run(updatePlayerQuery);
  request.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteSqlQuery = `
     DELETE FROM
        cricket_team
     WHERE
        player_id = ${playerId};
     `;
  await db.run(deleteSqlQuery);
  response.send("Player Removed");
});
