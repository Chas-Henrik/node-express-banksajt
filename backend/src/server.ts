import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise'

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
  id: number;
  token: string;
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

// Din kod här. Skriv dina arrayer
const users: User[] = []; 
const accounts: Account[] = [];
const sessions: Session[] = [];

// Din kod här. Skriv dina routes:

// Registrera användare
app.post('/users', async (req, res) => {
  const { username, password } = req.body;

});


// Starta servern
app.listen(PORT, () => {
    console.log(`Bankens backend körs på http://localhost:${PORT}`);
});
