let forms = document.getElementById('signupform');
forms?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = forms.username.value;
    const password = forms.password.value;

    try {
        const res = await axios.post("http://localhost:8000/users", {
            username,
            password
        });
        console.log(res.data);
        window.location.href = "/login";

    } catch (error) {
        console.error(error);
    }

});



//login form  


let loginform = document.getElementById("loginform");

loginform?.addEventListener("submit", async (e) => {

    try {
    e.preventDefault();
    const username = loginform.username.value;
    const password = loginform.password.value;



    const res = await axios.post("http://localhost:8000/loginusers", {
        username,
        password
    }, {withCredentials: true});
    window.location.href ="/dashboard";
        //window.location.href = "/dashboard";
    


}catch(error){
    if(error.status === 404){
        window.location.href = "signup";
    }else{

    console.error(error.response);
    }
}
});

// create notes

let noteform = document.getElementById("noteform");
noteform?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try{

        const title = noteform.title.value;
        const description = noteform.description.value;

        const res = await axios.post("http://localhost:8000/notes", {
            title,
            description
        }, {withCredentials: true});
        window.location.href = "/dashboard";

    }catch(error){
        console.log(error.response);
    }




});

// display notes on the index page

let notesList = document.getElementById("notes-list");

async function loadNotes() {
    try {
        const res = await axios.get("http://localhost:8000/indexnotes", {withCredentials: true});
        const notes = res.data.data;

        notes.forEach((note) => {
            const noteEl = document.createElement("div");
            noteEl.classList.add("note");

            const titleEl = document.createElement("h3");
            titleEl.textContent = note.title;

            const descriptionEl = document.createElement("p");
            descriptionEl.textContent = note.description;

            const editLink = document.createElement("a");
            editLink.href = `/edit_note/${note.id}`;
            editLink.textContent = "Edit";

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.addEventListener("click", async () => {
                try {
                    await axios.delete(`http://localhost:8000/notes/${note.id}`, {withCredentials: true});
                    noteEl.remove();
                } catch (error) {
                    console.error(error.response);
                }
            });

            noteEl.appendChild(titleEl);
            noteEl.appendChild(descriptionEl);
            noteEl.appendChild(editLink);
            noteEl.appendChild(deleteBtn);
            notesList.appendChild(noteEl);
        });

    } catch (error) {
        console.error(error.response);
    }
}

if (notesList) {
    loadNotes();
}

// edit note

let editnoteform = document.getElementById("editnoteform");

if (editnoteform) {
    const noteId = window.location.pathname.split("/").pop();

    (async () => {
        try {
            const res = await axios.get(`http://localhost:8000/notes/${noteId}`, {withCredentials: true});
            editnoteform.title.value = res.data.data.title;
            editnoteform.description.value = res.data.data.description;
        } catch (error) {
            console.error(error.response);
        }
    })();

    editnoteform.addEventListener("submit", async (e) => {
        e.preventDefault();
        try {
            const title = editnoteform.title.value;
            const description = editnoteform.description.value;

            await axios.put(`http://localhost:8000/notes/${noteId}`, {
                title,
                description
            }, {withCredentials: true});
            window.location.href = "/dashboard";

        } catch (error) {
            console.log(error.response);
        }
    });
}

