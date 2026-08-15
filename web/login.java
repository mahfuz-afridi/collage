/* =========================================================
   PASSWORD SHOW / HIDE
========================================================= */

const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");


togglePassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        this.innerHTML =
            '<i class="fa-solid fa-eye-slash"></i>';

    } else {

        passwordInput.type = "password";

        this.innerHTML =
            '<i class="fa-solid fa-eye"></i>';
    }

});


/* =========================================================
   LOGIN FORM
========================================================= */

const loginForm = document.getElementById("loginForm");

const loginMessage = document.getElementById("loginMessage");


loginForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const loginId =
        document.getElementById("loginId").value.trim();

    const password =
        document.getElementById("password").value.trim();


    /* Empty validation */

    if (loginId === "" || password === "") {

        loginMessage.textContent =
            "Please enter your Login ID and Password.";

        loginMessage.style.color = "#e53935";

        return;
    }


    /*
        এখানে পরে তোমার real login system
        connect করতে পারবে।
    */


    loginMessage.textContent =
        "Login successful!";

    loginMessage.style.color = "#0a9b55";


    console.log("Login ID:", loginId);

});