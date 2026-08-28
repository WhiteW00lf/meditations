import express, {type NextFunction} from "express";
import type {Request, Response} from "express";
import path, {resolve} from "path";
import {prisma} from "./prismaclient";
import bcrypt from "bcrypt"
import type {User} from "./generated/prisma/client";
import jwt from 'jsonwebtoken';
import {env} from "prisma/config";
import cookieParser from "cookie-parser";

declare global {
    namespace Express{
        interface Request {
            user? : String |  jwt.JwtPayload;
        }
    }
}


const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());


function AuthMiddleware(req: Request, res: Response, next: NextFunction) {

        let tokenfromuser = req.cookies.token;
        if (!tokenfromuser) {
          return   res.status(401).send("Unauthorized");
        }

    try {
        let decoded = jwt.verify(tokenfromuser as string, process.env.SECRET as string);
        req.user = decoded;
        next();

    }catch(err) {
            console.error(err);
            return res.status(401).send("Unauthorized");

    }




}

app.get("/", (req: Request, res: Response) => {
    res.status(200).send("Hello from meditation");
});

app.get("/dashboard", AuthMiddleware, (req: Request, res: Response) => {
    res.send("Dashboard");


});

app.get("/signup", (req: Request, res: Response) => {
    res.status(200).sendFile(path.join(__dirname, "public/signup.html"));

});

app.get("/login", (req: Request, res: Response) => {
    res.status(200).sendFile(path.join(__dirname, "public/login.html"));

});

// POST request of signup form points here. Redirects to /login if successful.

app.post("/users", async (req: Request, res: Response) => {


    try {
        const username: string = req.body.username;
        const password: string = req.body.password;

        const userExists = await prisma.user.findFirst({
            where: {
                name: {
                    equals: username,
                    mode: 'insensitive'
                }

            }


        })

        if (userExists) {

            return res.json({"message": "User already exists"});

        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name: username,
                password: hashedPassword

            }
        })


    } catch (e) {
        console.log(e);
    }


});

app.post("/loginusers", async (req: Request, res: Response) => {

    try {
        const username = req.body.username;
        const password = req.body.password;
        //    console.log(username);
        //    console.log(password);

        const userExists = await prisma.user.findFirst({
            where: {
                name: {
                    equals: username,
                    mode: 'insensitive'
                }

            }


        })

        console.log(userExists);

        if (userExists === null) {
            return res.status(404).json({message: "User not found"});
        }

        let unhashPassword = await bcrypt.compare(password, userExists.password);
        if (unhashPassword) {

            let jwt_secret = process.env.SECRET as string ;
            let token = jwt.sign({username: userExists.id}, jwt_secret, {expiresIn: "1 hr"});
            res.cookie("token",
                token,
                {maxAge: 1000 * 60 * 60,httpOnly: true, secure: false, sameSite: "lax"});
            return res.json({"status":200, message: "User logged in"});

        } else {
            return res.status(403).json({"message": "Incorrect username or password"});

        }


    } catch (error: any) {
        console.log(error.code);

    }


});


app.listen(8000, () => {
    console.log("Running on port 8000");
})