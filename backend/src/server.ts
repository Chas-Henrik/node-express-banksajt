import express from 'express';
import cors from 'cors';
import mysql, { ResultSetHeader } from 'mysql2/promise'

// Data Types
type User = {
  id: number;
  username: string;
  password: string;
}

type Account = {
  id: number;
  userId: number;
  amount: number;
}

type Session = {
  userId: number;
  token: string;
}

type RegisterResponse = {
  user: User;
  account: Account;
}

// Constants
const PORT = 3000;

// Uppkoppling mot databasen
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "banksajt",
  port: 3306
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Generera engångslösenord
function generateOTP() {
    // Generera en sexsiffrig numerisk OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp.toString();
}

// Send SQL Query to database
async function query<T>(sql:string, params: any[]) {
  const [result] = await pool.execute(sql, params)
  return result as T;
}

// Din kod här. Skriv dina routes:

// Skapa användare och lösenord i users-tabellen & account i accounts-tabellen
app.post("/users", async (req, res) => {

  const { username, password } = req.body;
  console.log(username, password);

  try {
    const result1: ResultSetHeader = await query<ResultSetHeader>(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, password]
    );
    const user = {id: result1.insertId, username: username, password: password};

    const result2: ResultSetHeader = await query<ResultSetHeader>(
      "INSERT INTO accounts (userId, amount) VALUES (?, ?)",
      [user.id, 0]
    );
    const account = {id: result2.insertId, userId: user.id, amount: 0};
    const result: RegisterResponse = {user: user, account: account};

    console.log("User & Account created:");
    console.log(result);

    res.status(201).json(result);

  } catch(error) {
    console.log("Error creating user", error);
    res.status(500).send("Error creating user");
  }
});

// Logga in användare och skapa session
app.post("/sessions", async (req, res) => {

  const { username, password } = req.body;
  console.log(username, password);

  try {
    const users = await query<User[]>("SELECT id FROM users WHERE username = ? AND password = ? ", [username, password]);
    const user = users[0];
    console.log("user", user);
    console.log("id", user.id);

    const sessions: Session[] = await query<Session[]>("SELECT * FROM sessions WHERE userId = ? ", [user.id]);
    console.log("sessions", sessions);
    let token;
    if(sessions.length === 0) {
      token = generateOTP();
      await query<ResultSetHeader>(
        "INSERT INTO sessions (userId, token) VALUES (?, ?)",
        [user.id, token]
      );
    } else {
      token = sessions[0].token;
    }
    res.status(201).json({token: token});
    
  } catch(error) {
    console.log("Error creating session", error);
    res.status(500).send("Error creating session");
  }
});

app.post("/me/accounts", async (req, res) => {

  try {

    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith("Bearer ")) {
      
      const token = authHeader.split(" ")[1];
      console.log("token", token)

      const sessions : Session[] = await query<Session[]>(
        "SELECT * FROM sessions WHERE token = ?",
        [token]
      );
      
      const userId = sessions[0].userId

      const accounts : Account[] = await query<Account[]>(
        "SELECT amount FROM accounts WHERE userId = ?",
        [userId]
      ); 

      const amount = accounts[0].amount;
      console.log(amount)

      res.status(201).json({amount: amount});
  } else {
    res.status(401).send("Missing or invalid token");
  }

  } catch(error) {
    console.log("Error fetching account", error);
    res.status(500).send("Error fetching account");
  }
});

app.post("/me/accounts/transactions", async (req, res) => {

  try {

    const authHeader = req.headers.authorization;
    const { amount } = req.body;

    console.log("Amount", amount)

    if (authHeader && authHeader.startsWith("Bearer ")) {
      
      const token = authHeader.split(" ")[1];
      console.log("token", token)

      const sessions : Session[] = await query<Session[]>(
        "SELECT * FROM sessions WHERE token = ?",
        [token]
      );
      
      const userId = sessions[0].userId

      const amounts : Account[] = await query<Account[]>(
        "SELECT amount FROM accounts WHERE userId = ?",
        [userId]
      );

      const currentAmount = amounts[0].amount
      const newAmount = currentAmount + amount;

      const accounts : Account[] = await query<Account[]>(
        "UPDATE accounts SET amount = ? WHERE userId = ?",
        [newAmount, userId]
      ); 

      res.status(201).json({amount: newAmount});
    } else {
      res.status(401).send("Missing or invalid token");
    }
  } catch(error) {
    console.log("Error fetching account", error);
    res.status(500).send("Error fetching account");
  }
});

// Starta servern
app.listen(PORT, () => {
    console.log(`Bankens backend körs på http://localhost:${PORT}`);
});
