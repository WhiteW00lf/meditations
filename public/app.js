
let form = document.getElementById('form');
form.addEventListener("submit",async (e) => {
    e.preventDefault();
    const username  = form.username.value;
    const password = form.password.value;

    const res = await axios.post("http://localhost:8000/users",{
        username,
       password
    }).then((res) => { 
        console.log(res.data)
        window.location.href="/login"
    
    
})
    .catch((error) => console.error(error))

    // console.log(username);
    // console.log(password);
    
    

});