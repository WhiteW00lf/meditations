

let forms = document.getElementById('signupform');
forms?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = forms.username.value;
    const password = forms.password.value;

    const res = await axios.post("http://localhost:8000/users", {
        username,
        password
    }).then((res) => {
        console.log(res.data)
        window.location.href = "/login"


    })
        .catch((error) => console.error(error))

    // console.log(username);
    // console.log(password);



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
    });
    localStorage.setItem("tokenfromsurya", res.data.token);
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

