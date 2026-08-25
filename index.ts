import express from "express";
import type { Request, Response } from "express";
import path from "path";
import {prisma} from "./prismaclient";
import bcrypt from "bcrypt"

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req : Request,res : Response) => {
    res.status(200).send("Hello from meditation");
});

app.get("/signup", (req : Request, res: Response) => {
    res.status(200).sendFile(path.join(__dirname,"public/signup.html"));

});

app.get("/login", (req: Request, res: Response) => {
    res.status(200).send("Login Page");

});

app.post("/users", async (req: Request, res: Response) => {

    try{
        const username : string  = req.body.username;
        const password : string = req.body.password;
        const hashedPassword = await bcrypt.hash(password,10);

        const user = await prisma.user.create({
            data: {
                name: username,
                password: hashedPassword

            }
        })

        res.redirect("/login");

    }catch(e){
        console.log(e);
    }
    
    


});


app.listen(8000, () => {
    console.log("Running on port 8000");
})