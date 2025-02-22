import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const database = getDatabase();
const courseTitle = localStorage.getItem("courseTitle");
const courseCategory = localStorage.getItem("courseCategory");
const singleCourseContent = document.getElementById("single-course-content");

const fetchSingleCourse = async (title, category) => {
    try {
        const courseSnapshot = await get(ref(database, `admin/courses/${category}`));
        if (!courseSnapshot.exists()) return null;

        const coursesData = courseSnapshot.val();
        return Object.values(coursesData).find(course => course.title === title);
    } catch (error) {
        console.error("Error fetching single course:", error);
        return null;
    }
};

const displaySingleCourse = (course) => {
    if (!course) {
        singleCourseContent.innerHTML = `<p>Course not found.</p>`;
        return;
    }

    singleCourseContent.innerHTML = `
        <div class="card bg-white p-6 rounded-lg shadow-lg">
            <img src="${course.imageUrl}" alt="${course.title}" class="w-full h-48 object-cover rounded mb-4">
            <h3 class="text-xl font-bold mb-4">${course.title}</h3>
            <p class="text-gray-600">${course.description}</p>
            <p class="text-gray-600">Price: ${course.price || 'Free'}</p>
            <p class="text-gray-600">Category: ${course.category}</p>
        </div>
    `;
};

const init = async () => {
    const course = await fetchSingleCourse(courseTitle, courseCategory);
    displaySingleCourse(course);
};

init();