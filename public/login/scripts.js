function toggleForms() {
  const registerSection = document.getElementById("registerSection");
  const loginSection = document.getElementById("loginSection");
  registerSection.classList.toggle("hidden");
  loginSection.classList.toggle("hidden");
}
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  console.log(email);

  e.preventDefault();
  console.log("email: " + email);
  console.log("password: " + password);

  fetch("http://localhost:5502/login", {
    method: "POST",
    body: JSON.stringify({
      email: email,
      password: password,
    }),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  })
    .then((respose) => respose.json())
    .then((data) => {
      if (data.message === "logged") {
        window.localStorage.setItem("userId", data.userId);
        window.location.href = "/client/client.html";
      } else {
        alert("Email ou mot de passe invalide");
      }
    });
});

document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const email = document.getElementById("emailRegister").value;
  const password = document.getElementById("passwordRegister").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  console.log("Form data: ", { username, email, password, confirmPassword });

  fetch("http://localhost:5502/register", {
    method: "POST",
    body: JSON.stringify({
      username: username,
      emailRegister: email,
      passwordRegister: password,
      confirmPassword: confirmPassword,
    }),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  })
    .then((response) => response.text())
    .then((responseText) => {
      console.log(responseText);

      if (responseText === "registred") {
        alert("user regestred");
        window.location.href = "/login";
      } else {
        alert(responseText);
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      alert("An error occurred while registering." + error.message);
    });
});
