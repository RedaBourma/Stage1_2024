document
  .getElementById("ajouterArticleForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const RefArticle = document.getElementById("RefArticle").value;
    const nomArticle = document.getElementById("nomArticle").value;
    const CatArticle = document.getElementById("CatArticle").value;
    const description = document.getElementById("description").value;
    const prix = document.getElementById("prix").value;
    const quantite = document.getElementById("quantite").value;
    const imageFile = document.getElementById("articleImage").files[0];

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("RefArticle", RefArticle);
    formData.append("nomArticle", nomArticle);
    formData.append("CatArticle", CatArticle);
    formData.append("description", description);
    formData.append("prix", prix);
    formData.append("quantite", quantite);

    try {
      const response = await fetch("http://localhost:5503/admin/api/articles", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert("Article ajoute avec succes!");
      } else {
        alert("Erreur lors de l'ajout de l'article : " + result.message);
      }
    } catch (error) {
      console.log("Error submitting form:", error);
      alert("Une erreur s'est produit lors de la soumission du formulaire.");
    }
  });

// const commands = [];

async function fetchCommands() {
  const url = "http://localhost:5503/api/cmd";
  try {
    const respose = await fetch(url);

    if (!respose.ok) {
      console.error("Failed to fetch commands:", response.statusMessage);
      return;
    }
    const commands = await respose.json();
    displayCommands(commands);
  } catch (error) {
    console.error("Error fetching commands:", error);
  }
}

function displayCommands(commands) {
  const cmdList = document.getElementById("commandesTableBody");
  cmdList.innerHTML = "";
  commands.forEach((item) => {
    cmdList.innerHTML += `
              <tr>
                  <th scope="row">${item.id}</th>
                  <td>${item.username}</td>
                  <td>${item.article_id}</td>
                  <td>${item.quantity}</td>
                  <td>${item.order_date}</td>
                </tr>
        `;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  fetchCommands();
});
