import express, {type NextFunction} from "express";
import type {Request, Response} from "express";
import path, {resolve} from "path";
import {prisma} from "./prismaclient";
import bcrypt from "bcrypt"
import type {User} from "./generated/prisma/client";
import jwt, {type JwtPayload} from 'jsonwebtoken';
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


function AuthMiddleware( req: Request, res: Response, next: NextFunction)  {

        let tokenfromuser = req.cookies.token;
        if (!tokenfromuser) {
          return   res.status(401).send("Unauthorized");
        }

    try {
        let decoded =  jwt.verify(tokenfromuser as string, process.env.SECRET as string);
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
   // const allnotes = await prisma.note.findMany()

    res.sendFile(path.join(__dirname, "public/notes_index.html"));


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
            let token = jwt.sign({user_id: userExists.id}, jwt_secret, {expiresIn: "1 hr"});
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

/* CRUD FOR NOTES */

app.get("/create_note", AuthMiddleware, (req: Request, res: Response) => {

    res.status(200).sendFile(path.join(__dirname, "public/notes_create.html"));

});

app.post("/notes", AuthMiddleware,async (req: Request, res: Response) => {
    const title = req.body.title;
    const description = req.body.description;

    const newNote = await prisma.note.create({
       data: {
           title: title,
           description: description,
           user_Id : (req.user as JwtPayload).user_id,

       },
    });

    res.json({"status":201, message: "Note created"});
    console.log(newNote);





});

app.get("/indexnotes", AuthMiddleware, async (req: Request, res: Response) => {

    let allNotes = await prisma.note.findMany({
        where: {
            user_Id: (req.user as JwtPayload).user_id,
        },
    });

    res.json({"status":200, data: allNotes});
    console.log(allNotes);
})

app.get("/notes/:id", AuthMiddleware, async (req: Request, res: Response) => {

    const id = Number(req.params.id);
    const note = await prisma.note.findUnique({where: {id}});

    if (!note || note.user_Id !== (req.user as JwtPayload).user_id) {
        return res.status(404).json({message: "Note not found"});
    }

    res.json({"status": 200, data: note});
});

app.get("/edit_note/:id", AuthMiddleware, (req: Request, res: Response) => {

    res.status(200).sendFile(path.join(__dirname, "public/notes_edit.html"));

});

app.put("/notes/:id", AuthMiddleware, async (req: Request, res: Response) => {

    const id = Number(req.params.id);
    const title = req.body.title;
    const description = req.body.description;

    const note = await prisma.note.findUnique({where: {id}});

    if (!note || note.user_Id !== (req.user as JwtPayload).user_id) {
        return res.status(404).json({message: "Note not found"});
    }

    const updatedNote = await prisma.note.update({
        where: {id},
        data: {title, description},
    });

    res.json({"status": 200, message: "Note updated", data: updatedNote});
});

app.delete("/notes/:id", AuthMiddleware, async (req: Request, res: Response) => {

    const id = Number(req.params.id);

    const note = await prisma.note.findUnique({where: {id}});

    if (!note || note.user_Id !== (req.user as JwtPayload).user_id) {
        return res.status(404).json({message: "Note not found"});
    }

    await prisma.note.delete({where: {id}});

    res.json({"status": 200, message: "Note deleted"});
});

app.listen(8000, () => {
    console.log("Running on port 8000");
});


