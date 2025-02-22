// import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
// import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// const firebaseConfig = {
//   apiKey: "AIzaSyB5iAUnK_5AP7ijrcQvlRfvCSfXrH9n6Ak",
//   authDomain: "index-16f53.firebaseapp.com",
//   projectId: "index-16f53",
//   storageBucket: "index-16f53.firebasestorage.app",
//   messagingSenderId: "171804052014",
//   appId: "1:171804052014:web:c38d9d50835d551cafadbf"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const database = getDatabase(app);

// // Function to initialize user data
// async function initializeUserData(userId) {
//   try {
//     await set(ref(database, `userProfiles/${userId}`), {
//       paymentCertificates: [],
//       watchLater: [],
//       addToCart: [],
//     });
//   } catch (error) {
//     console.error("Error initializing user data: ", error);
//   }
// }

// document.addEventListener("DOMContentLoaded", () => {
//   // Signup functionality
//   const signupForm = document.getElementById("signupForm");
//   if (signupForm) {
//     signupForm.addEventListener("submit", async (e) => {
//       e.preventDefault();
//       const username = document.getElementById("signupName").value;
//       const email = document.getElementById("signupEmail").value;
//       const pass = document.getElementById("signupPassword").value;

//       if (username === "" || email === "" || pass === "") {
//         Swal.fire({
//           icon: "error",
//           title: "Input Error",
//           text: "Please fill out all fields."
//         });
//         return;
//       }

//       try {
//         const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
//         const userId = userCredential.user.uid;

//         await set(ref(database, `users/${userId}`), {
//           username: username,
//           email: email,
//           password: pass
//         });

//         await initializeUserData(userId);

//         document.getElementById("signupName").value = "";
//         document.getElementById("signupEmail").value = "";
//         document.getElementById("signupPassword").value = "";

//         Swal.fire({
//           title: "Signup Successful!",
//           text: "Please login with your credentials.",
//           icon: "success"
//         }).then(() => {
//           const signupModal = bootstrap.Modal.getInstance(document.getElementById("signupModal"));
//           if (signupModal) signupModal.hide();

//           const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
//           loginModal.show();
//         });
//       } catch (error) {
//         Swal.fire({
//           icon: "error",
//           title: "Signup Error",
//           text: error.message
//         });
//       }
//     });
//   }

//   // Login functionality
//   const loginForm = document.getElementById("loginForm");
//   if (loginForm) {
//     loginForm.addEventListener("submit", async (e) => {
//       e.preventDefault();
//       const email = document.getElementById("loginEmail").value;
//       const pass = document.getElementById("loginPassword").value;

//       if (email === "" || pass === "") {
//         Swal.fire({
//           icon: "error",
//           title: "Input Error",
//           text: "Please enter both email and password."
//         });
//         return;
//       }

//       try {
//         const userCredential = await signInWithEmailAndPassword(auth, email, pass);
//         const userId = userCredential.user.uid;
//         localStorage.setItem('userid', userId);

//         const userSnapshot = await get(ref(database, `users/${userId}`));
//         if (userSnapshot.exists()) {
//           const userData = userSnapshot.val();
//           localStorage.setItem('username', userData.username);

//           document.getElementById("loginEmail").value = "";
//           document.getElementById("loginPassword").value = "";

//           Swal.fire({
//             title: `Hi, Welcome ${userData.username}!`,
//             icon: "success"
//           }).then(() => {
//             window.location.href = "main.html";
//           });
//         } else {
//           await set(ref(database, `users/${userId}`), {
//             email: email,
//             password: pass,
//             username: email.split('@')[0]
//           });

//           document.getElementById("loginEmail").value = "";
//           document.getElementById("loginPassword").value = "";

//           Swal.fire({
//             title: `Welcome ${email.split('@')[0]}! Your account has been created.`,
//             icon: "success"
//           }).then(() => {
//             window.location.href = "main.html";
//           });
//         }
//       } catch (error) {
//         document.getElementById("loginEmail").value = "";
//         document.getElementById("loginPassword").value = "";
//         Swal.fire({
//           icon: "error",
//           title: "Login Error",
//           text: error.message
//         }).then(() => {
//           const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
//           if (loginModal) loginModal.show();
//         });
//       }
//     });
//   }
//     // Admin login functionality
//     const adminLoginForm = document.getElementById("adminLoginForm");
//     if (adminLoginForm) {
//       adminLoginForm.addEventListener("submit", async (e) => {
//         e.preventDefault();
//         const adminEmail = document.getElementById("adminEmail").value;
//         const adminPassword = document.getElementById("adminPassword").value;
  
//         if (adminEmail === "tejasri6486@gmail.com" && adminPassword === "Teju64@8") {
//           Swal.fire({
//             title: "Admin Login Successful!",
//             text: "Redirecting to admin page...",
//             icon: "success"
//           }).then(() => {
//             window.location.href = "admin.html";
//           });
//         } else {
//           Swal.fire({
//             icon: "error",
//             title: "Unauthorized",
//             text: "Invalid email or password."
//           });
//         }
//       });
//     }
//   // "Already have an account? Login" button in signup modal
//   const loginLink = document.getElementById("loginLink");
//   if (loginLink) {
//     loginLink.addEventListener("click", (e) => {
//       e.preventDefault();
//       const signupModal = bootstrap.Modal.getInstance(document.getElementById("signupModal"));
//       if (signupModal) signupModal.hide();

//       const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
//       loginModal.show();
//     });
//   }
// });

// export { app, auth, database };
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB5iAUnK_5AP7ijrcQvlRfvCSfXrH9n6Ak",
  authDomain: "index-16f53.firebaseapp.com",
  projectId: "index-16f53",
  storageBucket: "index-16f53.appspot.com",
  messagingSenderId: "171804052014",
  appId: "1:171804052014:web:c38d9d50835d551cafadbf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

async function initializeUserData(userId) {
  try {
    await set(ref(database, `userProfiles/${userId}`), {
      paymentCertificates: [],
      watchLater: [],
      addToCart: [],
    });
  } catch (error) {
    console.error("Error initializing user data: ", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const emailSignupButton = document.getElementById("emailSignupButton");
  if (emailSignupButton) {
    emailSignupButton.addEventListener("click", async () => {
      const username = document.getElementById("signupName").value;
      const email = document.getElementById("signupEmail").value;
      const pass = document.getElementById("signupPassword").value;

      if (username === "" || email === "" || pass === "") {
        Swal.fire({
          icon: "error",
          title: "Input Error",
          text: "Please fill out all fields."
        });
        return;
      }

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const userId = userCredential.user.uid;

        await set(ref(database, `users/${userId}`), {
          username: username,
          email: email,
          password: pass  // Note: Storing plain text passwords is not recommended
        });

        await initializeUserData(userId);

        document.getElementById("signupName").value = "";
        document.getElementById("signupEmail").value = "";
        document.getElementById("signupPassword").value = "";

        Swal.fire({
          title: "Signup Successful!",
          text: "Please login with your credentials.",
          icon: "success"
        }).then(() => {
          const signupModal = bootstrap.Modal.getInstance(document.getElementById("signupModal"));
          if (signupModal) signupModal.hide();

          const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
          loginModal.show();
        });

      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Signup Error",
          text: error.message
        });
      }
    });
  }

  const btns = document.getElementById("btns");
  if (btns) {
    btns.addEventListener("click", async () => {
      const email = document.getElementById("loginEmail").value;
      const pass = document.getElementById("loginPassword").value;

      if (email === "" || pass === "") {
        Swal.fire({
          icon: "error",
          title: "Input Error",
          text: "Please enter both email and password."
        });
        return;
      }

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const userId = userCredential.user.uid;
        localStorage.setItem('userid', userId);

        const userSnapshot = await get(ref(database, `users/${userId}`));
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          localStorage.setItem('username', userData.username);

          document.getElementById("loginEmail").value = "";
          document.getElementById("loginPassword").value = "";

          Swal.fire({
            title: `Hi, Welcome ${userData.username}!`,
            icon: "success"
          }).then(() => {
            window.location.href = "main.html";
          });
        } else {
          await set(ref(database, `users/${userId}`), {
            email: email,
            password: pass,
            username: email.split('@')[0]
          });

          document.getElementById("loginEmail").value = "";
          document.getElementById("loginPassword").value = "";

          Swal.fire({
            title: `Welcome ${email.split('@')[0]}! Your account has been created.`,
            icon: "success"
          }).then(() => {
            window.location.href = "main.html";
          });
        }
      } catch (error) {
        document.getElementById("loginEmail").value = "";
        document.getElementById("loginPassword").value = "";
        Swal.fire({
          icon: "error",
          title: "Login Error",
          text: error.message
        }).then(() => {
          const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
          if (loginModal) loginModal.show();
        });
      }
    });
  }

  const log = document.getElementById("log");
  if (log) {
    log.addEventListener("click", () => {
      const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
      loginModal.show();
    });
  }

  const sin = document.getElementById("sin");
  if (sin) {
    sin.addEventListener("click", () => {
      const signupModal = new bootstrap.Modal(document.getElementById("signupModal"));
      signupModal.show();
    });
  }
});

export { app, auth, database };