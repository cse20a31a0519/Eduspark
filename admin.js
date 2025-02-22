import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getDatabase, ref, get, set, child } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB5iAUnK_5AP7ijrcQvlRfvCSfXrH9n6Ak",
    authDomain: "index-16f53.firebaseapp.com",
    projectId: "index-16f53",
    storageBucket: "index-16f53.firebasestorage.app",
    messagingSenderId: "171804052014",
    appId: "1:171804052014:web:c38d9d50835d551cafadbf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Fetch Courses and Display in Cards
const fetchCourses = async () => {
    try {
        const coursesSnapshot = await get(ref(database, "admin/courses"));
        if (!coursesSnapshot.exists()) return [];

        const coursesData = coursesSnapshot.val();
        const allCourses = [];

        Object.keys(coursesData).forEach(category => {
            const categoryCourses = coursesData[category];
            Object.values(categoryCourses).forEach(course => {
                allCourses.push({
                    ...course,
                    type: course.type || "free",
                    category
                });
            });
        });

        return allCourses;
    } catch (error) {
        console.error("Error fetching courses:", error);
        return [];
    }
};

// Display Courses
const displayCourses = async () => {
    const courseCards = document.getElementById("course-cards");
    const courses = await fetchCourses();
    courseCards.innerHTML = "";

    if (courses.length > 0) {
        courses.forEach(course => {
            const courseCard = document.createElement("div");
            courseCard.className = "bg-white p-4 rounded shadow hover:shadow-lg transition-shadow duration-300";
            let imageUrl = course.image;
            if (imageUrl && imageUrl.startsWith("hhttps")) {
                imageUrl = imageUrl.replace("hhttps", "https");
            }
            courseCard.innerHTML = `
                <img src="${imageUrl || 'placeholder.jpg'}" alt="${course.title}" class="w-48 h-28  object-cover rounded mb-4">
                <h3 class="text-xl font-bold">${course.title}</h3>
                <p class="text-gray-600">${course.description || "No description available."}</p>
                <span class="inline-block mt-2 px-3 py-1 text-sm font-semibold text-white ${course.type === 'premium' ? 'bg-red-500' : 'bg-green-500'} rounded">${course.type}</span>
            `;
            courseCards.appendChild(courseCard);
        });
    } else {
        courseCards.innerHTML = "<p class='text-gray-600'>No courses available.</p>";
    }
};

// Fetch Users and Display in Table
const displayUsers = async () => {
    const userTableBody = document.getElementById("user-table-body");
    userTableBody.innerHTML = "";

    try {
        const usersSnapshot = await get(ref(database, "users"));
        if (usersSnapshot.exists()) {
            const users = usersSnapshot.val();
            for (const userId in users) {
                const user = users[userId];
                const enrolledCourses = user.enrolledCourses ? Object.values(user.enrolledCourses).map(course => course.title).join(', ') : 'None';
                const payments = user.payments ? Object.values(user.payments).map(payment => `$${payment.amount} on ${new Date(payment.date).toLocaleDateString()}`).join(', ') : 'None';

                const userRow = document.createElement("tr");
                userRow.className = "hover:bg-gray-100 transition-colors duration-200";
                userRow.innerHTML = `
                    <td class="py-3 px-4 border-b">${userId}</td>
                    <td class="py-3 px-4 border-b">${user.email}</td>
                    <td class="py-3 px-4 border-b">${enrolledCourses}</td>
                    <td class="py-3 px-4 border-b">${payments}</td>
                    <td class="py-3 px-4 border-b">
                        <button class="delete-user bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600 transition-colors duration-200" data-user-id="${userId}">Delete</button>
                    </td>
                `;
                userTableBody.appendChild(userRow);
            }

            // Handle User Deletion
            document.querySelectorAll(".delete-user").forEach(button => {
                button.addEventListener("click", async (e) => {
                    const userId = e.target.getAttribute("data-user-id");
                    await set(ref(database, `users/${userId}`), null);
                    e.target.closest("tr").remove();
                    Swal.fire({
                        icon: "success",
                        title: "User Deleted",
                        text: `User with ID ${userId} has been deleted.`
                    });
                });
            });
        } else {
            userTableBody.innerHTML = "<tr><td colspan='5' class='py-3 px-4 border-b text-center text-gray-600'>No users available.</td></tr>";
        }
    } catch (error) {
        console.error("Error fetching users:", error);
    }
};

// Handle Logout
document.getElementById("logout").addEventListener("click", async () => {
    try {
        await signOut(auth);
        Swal.fire({
            icon: "success",
            title: "Logged Out",
            text: "You have been logged out."
        }).then(() => {
            window.location.href = "index.html";
        });
    } catch (error) {
        console.error("Logout error:", error);
    }
});

// Load Data on Page Load
document.addEventListener("DOMContentLoaded", async () => {
    await displayCourses();
    await displayUsers();
});