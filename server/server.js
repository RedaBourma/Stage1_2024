const express = require("express");
const path = require("path");
const multer = require("multer");
const cors = require("cors");

const server = express();
const port = 5502;
const adminServer = express();
const adminPort = 5503;

server.use(cors());
server.use(express.urlencoded({ extended: true }));
server.use(express.json());
server.use(express.static(path.join(__dirname, "../public")));
server.use("/assets", express.static(path.join(__dirname, "../assets")));
server.use(
  "/assets/products",
  express.static(path.join(__dirname, "../assets/products"))
);

adminServer.use(cors());
adminServer.use(express.urlencoded({ extended: true }));
adminServer.use(express.json());
adminServer.use(express.static(path.join(__dirname, "../public/admin")));
adminServer.use("/assets", express.static(path.join(__dirname, "../assets")));
adminServer.use(
  "/assets/products",
  express.static(path.join(__dirname, "../assets/products"))
);

adminServer.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/admin/admin.html"));
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Destination called", file);
    cb(null, path.join(__dirname, "../assets/products"));
  },
  filename: (req, file, cb) => {
    console.log("Filename called", file);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log("Processing file:", file);
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

const mysql = require("mysql");
// const { error } = require("console");
// const { truncateSync } = require("fs");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "0000",
  database: "SOURETEL",
});

connection.connect();

const uploadDir = path.join(__dirname, "../assets/products");
const fs = require("fs");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

adminServer.post("/admin/api/articles", upload.single("image"), (req, res) => {
  // upload.single("articleImage")(req, res, (err) =>{
  //   if(err instanceof multer.MulterError){
  //     return res.status(500).json({message: "Multer error", error: err});
  //   } else if (err) {
  //     return res.status(500).json({message: "An error occured", error: err});
  //   }
  // })

  const { RefArticle, nomArticle, CatArticle, description, prix, quantite } =
    req.body;
  console.log(req.body);
  console.log(req.body.imageFile);

  if (!nomArticle || !description || !prix || !quantite || !req.file) {
    return res.status(400).json({
      message:
        "Tous les champs sont obligatoires et l'image doit être téléchargée.",
    });
  }

  const imageUrl = `/assets/products/${req.file.filename}`;
  console.log(imageUrl);

  const query =
    "INSERT INTO Articles (reference, nom, category, prix, quantite, image_url, description) VALUES (?,?,?,?,?,?,?)";
  connection.query(
    query,
    [RefArticle, nomArticle, CatArticle, prix, quantite, imageUrl, description],
    (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Erreur lors de l'ajout de l'article", error });
      }
      res.status(200).json({ messsage: "Article ajoute avec succes" });
    }
  );
});

server.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query =
    "SELECT id,Email,Password FROM Utilisateur where Email=? and Password=?";
  connection.query(query, [email, password], (error, results, fields) => {
    if (error) {
      return res.send("Database query error in /login post");
    }
    if (results.length > 0) {
      // console.log(results)
      const userId = results[0].id;
      // console.log("====="+userId+"=====")
      res.send({ message: "logged", userId });
    } else {
      res.send("Invalid email or password");
    }
  });
});

server.post("/register", (req, res) => {
  console.log("Request received for registration");

  const { username, emailRegister, passwordRegister, confirmPassword } =
    req.body;

  console.log(username, emailRegister, passwordRegister, confirmPassword);

  if (passwordRegister !== confirmPassword) {
    return res.send("Les mots de passe ne correspondent pas.");
  }

  const query = "SELECT * FROM Utilisateur WHERE Email = ?";
  connection.query(query, [emailRegister], (error, results) => {
    if (error) {
      return res.send("Database query error in /register post");
    }
    if (results.length > 0) {
      console.log("User already exists");
      return res.send("User already exists");
    }
    const insertQuery =
      "INSERT INTO Utilisateur (UserName, Email, Password) values(?,?,?)";
    connection.query(
      insertQuery,
      [username, emailRegister, passwordRegister],
      (error) => {
        if (error) {
          return res.send("Error inserting user" + error.message);
        }
        res.send("registred");
      }
    );
  });
});

server.get("/client", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/client/client.html"));
});

adminServer.get("/api/cmd", (req, res) => {
  const query = `
    SELECT Commandes.*, Utilisateur.UserName AS username 
    FROM Commandes 
    JOIN Utilisateur ON Commandes.utilisateur_id = Utilisateur.id
  `;
  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

server.get("/api/products", (req, res) => {
  const query = "SELECT * FROM Articles ";
  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
      // console.log(results)
    }
  });
});

server.get("/api/products/category", (req, res) => {
  const query = "SELECT * FROM Articles ";
  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
      // console.log(results)
    }
  });
});

server.get("/api/products/category/:category", (req, res) => {
  const category = req.params.category;
  console.log("----" + category);
  const query = "SELECT * FROM Articles  WHERE category = ?";
  connection.query(query, [category], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
      // console.log(results)
    }
  });
});

server.post("/api/checkout", async (req, res) => {
  const cart = req.body.cart;
  const utilisateurId = req.body.utilisateurId;
  console.log("Utilisateur ID:", utilisateurId);

  try {
    // Start transaction
    await new Promise((resolve, reject) => {
      connection.beginTransaction((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const insertCommandQuery = `INSERT INTO Commandes (utilisateur_id, article_id, quantity) VALUES ?`;

    const commandesValues = cart.map((item) => {
      console.log("Cart Item:", item);
      return [utilisateurId, item.id, item.quantity];
    });

    console.log("Commandes Values:", commandesValues);

    await new Promise((resolve, reject) => {
      connection.query(insertCommandQuery, [commandesValues], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    for (const item of cart) {
      const updateStockQuery = `
        UPDATE Articles 
        SET quantite = quantite - ? 
        WHERE id = ?
      `;
      console.log(
        "Updating stock for item ID:",
        item.id,
        "with quantity:",
        item.quantity
      ); // Log for debugging
      await new Promise((resolve, reject) => {
        connection.query(
          updateStockQuery,
          [item.quantity, item.id],
          (err, result) => {
            if (err) return reject(err);
            if (result.affectedRows === 0) {
              return reject(
                new Error(`Stock insuffisant pour l'article: ${item.id}`)
              );
            }
            resolve(result);
          }
        );
      });
    }

    await new Promise((resolve, reject) => {
      connection.commit((err) => {
        if (err) {
          connection.rollback(() => reject(err));
        } else {
          resolve();
        }
      });
    });

    // Send success response
    res
      .status(200)
      .json({ message: "Commande validée et stock mis à jour avec succès." });
  } catch (error) {
    // Rollback transaction in case of any error
    await new Promise((resolve, reject) => {
      connection.rollback(() => resolve());
    });

    console.error("Erreur lors du checkout:", error);
    res.status(500).json({ error: error.message });
  }
});

// server.post("/api/checkout", async (req, res) => {
//   const cart = req.body;

//   try {
//     const updatePromises = cart.map(async (item) => {
//       const query = "UPDATE Articles SET quantite = quantite - ? WHERE id = ?";
//       return new Promise((resolve, reject) => {
//         connection.query(query, [item.quantity, item.id], (err, result) => {
//           if (err) {
//             console.error("Erreur SQL:", err);
//             return reject(new Error("Erreur lors de la mise à jour du stock."));
//           } else if (result.affectedRows === 0) {
//             return reject(
//               new Error(`Stock insuffisant pour le produit: ${item.nom}`)
//             );
//           }
//           resolve();
//         });
//       });
//     });

//     await Promise.all(updatePromises);
//     res
//       .status(200)
//       .json({ message: "Commande validée et stock mis à jour avec succès." });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// server.get("/", (req, res) => {
//   res.redirect("/login");
// });

server.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login/login.html"));
});

// server.get("/register", (req, res) => {
//   res.sendFile(path.join(__dirname, "../public/login/register.html"));
// });

server.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login/login.html"));
});

server.post("/login", (req, res) => {
  console.log(req.body);
});

server.post("/register", (req, res) => {
  console.log(req.body);
});

server.listen(port, (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " + port
    );
  else console.log("Error occurred, server can't start", error);
});

adminServer.listen(adminPort, () => {
  console.log(`Admin server is running on port ${adminPort}`);
});
