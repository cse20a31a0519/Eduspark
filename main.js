import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase configuration
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

// DOM elements
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const welcomeMessage = document.getElementById("welcome-message");
const searchBar = document.getElementById("search-bar");
const coursesContainer = document.getElementById("courses-container");
const defaultHome = document.getElementById("default-home");
const enrolledCoursesSection = document.getElementById("enrolled-courses");
const savedVideosSection = document.getElementById("saved-videos");
const paymentsSection = document.getElementById("payments");
const certificatesSection = document.getElementById("certificates");

let userId = null;

// Fetch and display courses
const fetchCourses = async (selectedCategory = null) => {
    try {
        const coursesSnapshot = await get(ref(database, "admin/courses"));
        if (!coursesSnapshot.exists()) return [];

        const coursesData = coursesSnapshot.val();
        const allCourses = [];

        Object.keys(coursesData).forEach((category) => {
            if (!selectedCategory || selectedCategory === category) {
                const categoryCourses = coursesData[category];
                Object.values(categoryCourses).forEach((course) => {
                    allCourses.push({ ...course, type: course.type || "free", category });
                });
            }
        });

        return allCourses;
    } catch (error) {
        console.error("Error fetching courses:", error);
        return [];
    }
};

// Display courses
const displayCourses = (courses) => {
    coursesContainer.innerHTML = "";
    courses.forEach((course) => {
        const courseCard = document.createElement("div");
        courseCard.className = "bg-white p-6 rounded-lg shadow-lg";
        courseCard.innerHTML = `
            <img src="${course.imageUrl}" alt="${course.title}" class="w-full h-48 object-cover rounded mb-4">
            <h3 class="text-xl font-bold">${course.title}</h3>
            <p class="text-gray-600">${course.description}</p>
            <button class="play-all bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mt-4" data-course-title="${course.title}">Play All</button>
            <button class="enroll bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2" data-course-title="${course.title}">Enroll</button>
        `;
        coursesContainer.appendChild(courseCard);
    });
};

// Event listeners for explore buttons
document.querySelectorAll(".explore-now").forEach(button => {
    button.addEventListener("click", (e) => {
        const category = e.target.getAttribute("data-category");
        fetchCourses(category).then(courses => {
            coursesContainer.classList.remove("hidden");
            displayCourses(courses);
        });
    });
});

// Handle search bar
searchBar.addEventListener("input", async (e) => {
    const query = e.target.value.toLowerCase();
    if (query === "") {
        coursesContainer.classList.add("hidden");
        return;
    }

    const courses = await fetchCourses();
    const filteredCourses = courses.filter(course => course.title.toLowerCase().includes(query));
    coursesContainer.classList.remove("hidden");
    displayCourses(filteredCourses);
});

// Check auth state
onAuthStateChanged(auth, (user) => {
    if (user) {
        userId = user.uid;
        welcomeMessage.textContent = `Hi, Welcome ${user.email}`;
        loginBtn.classList.add("hidden");
        logoutBtn.classList.remove("hidden");
    } else {
        userId = null;
        welcomeMessage.textContent = "Hi, Welcome User";
        loginBtn.classList.remove("hidden");
        logoutBtn.classList.add("hidden");
    }
});

// Event listeners for play all buttons
document.querySelectorAll('.play-all').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        const courseTitle = button.dataset.courseTitle;
        const course = courses.find(c => c.title === courseTitle);

        if (course) {
            try {
                const isEnrolled = await checkEnrollment(course, userId);

                if (isEnrolled) {
                    if (course.type === "premium") {
                        const isPaid = await checkPayment(course, userId);
                        if (isPaid) {
                            navigateToSingleCourse(course.title, course.category);
                        } else {
                            Swal.fire({
                                title: 'Info',
                                text: 'Please complete the payment for this premium course.',
                                confirmButtonText: 'OK',
                                showCloseButton: true
                            });
                        }
                    } else {
                        navigateToSingleCourse(course.title, course.category);
                    }
                } else {
                    Swal.fire({
                        title: 'Info',
                        text: 'Please enroll in the course first.',
                        confirmButtonText: 'OK',
                        showCloseButton: true
                    });
                }
            } catch (error) {
                console.error("Error fetching course data:", error);
                Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred. Please try again later.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    showCloseButton: true
                });
            }
        } else {
            console.error("Course not found for title:", courseTitle);
            Swal.fire('Error!', 'Course not found.', 'error');
        }
    });
});

// Event listeners for enroll buttons
document.querySelectorAll('.enroll').forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        const courseTitle = button.dataset.courseTitle;
        const course = courses.find(c => c.title === courseTitle);

        if (course) {
            await handleEnrollment(course, userId);
        } else {
            console.error("Course not found for title:", courseTitle);
            Swal.fire('Error!', 'Course not found.', 'error');
        }
    });
});

const handleEnrollment = async (course, userId) => {
    if (!course || !course.type || !course.title) {
        console.error("Course object is invalid:", course);
        Swal.fire('Error!', 'Invalid course data.', 'error');
        return;
    }

    try {
        const isEnrolled = await checkEnrollment(course, userId);
        if (isEnrolled) {
            Swal.fire({
                icon: 'info',
                title: 'Already Enrolled',
                text: 'You are already enrolled in this course.',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (course.type === "free") {
            const { value: userDetails } = await Swal.fire({
                title: `Enroll in ${course.title} (Free)`,
                html: `
                    <input id="swal-input-name" class="swal2-input" placeholder="Your Name">
                    <input id="swal-input-phone" class="swal2-input" placeholder="Phone Number">
                    <label style="display: block; margin-top: 10px;">
                        <input type="checkbox" id="swal-input-confirm" class="swal2-checkbox">
                        I confirm that I want to enroll in this course.
                    </label>
                `,
                showCloseButton: true,
                focusConfirm: false,
                preConfirm: () => {
                    const name = document.getElementById('swal-input-name').value;
                    const phone = document.getElementById('swal-input-phone').value;
                    const isConfirmed = document.getElementById('swal-input-confirm').checked;

                    if (!name || !phone) {
                        Swal.showValidationMessage(`Please enter all required details`);
                        return false;
                    }

                    if (!isConfirmed) {
                        Swal.showValidationMessage(`Please confirm your enrollment`);
                        return false;
                    }

                    return { name, phone };
                }
            });

            if (userDetails) {
                await enrollFreeCourse(course, userDetails, userId);
            }
            return;
        }

        if (course.type === "premium") {
            await showPaymentModule(course, userId);
        }
    } catch (error) {
        console.error("Error enrolling:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'There was an issue enrolling in the course. Please try again later.',
            confirmButtonText: 'OK'
        });
    }
};

const enrollFreeCourse = async (course, userDetails, userId) => {
    try {
        const userCoursesRef = ref(database, `users/${userId}/enrolledCourses`);
        const snapshot = await get(userCoursesRef);
        let enrolledCourses = snapshot.val() || [];

        if (enrolledCourses.some(enrolledCourse => enrolledCourse.title === course.title)) {
            await Swal.fire({
                icon: 'info',
                title: 'Already Enrolled',
                text: 'You are already enrolled in this free course.',
                confirmButtonText: 'OK'
            });
            return;
        }

        enrolledCourses.push({
            title: course.title,
            category: course.category,
            type: course.type,
            price: course.price || 'Free',
            enrolledOn: new Date().toISOString(),
            name: userDetails.name,
            phone: userDetails.phone
        });

        await set(userCoursesRef, enrolledCourses);

        await Swal.fire({
            icon: 'success',
            title: 'Enrolled Successfully!',
            text: `You have successfully enrolled in ${course.title}.`,
            confirmButtonText: 'OK'
        });
    } catch (error) {
        console.error("Error enrolling in course:", error);
        await Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'There was an issue enrolling in the course. Please try again later.',
            confirmButtonText: 'OK'
        });
    }
};

const checkEnrollment = async (course, userId) => {
    try {
        const userCoursesRef = ref(database, `users/${userId}/enrolledCourses`);
        const snapshot = await get(userCoursesRef);
        const enrolledCourses = snapshot.val() || [];

        return enrolledCourses.some(enrolledCourse => enrolledCourse.title === course.title);
    } catch (error) {
        return false; // Treat errors as not enrolled
    }
};

const checkPayment = async (course, userId) => {
    try {
        const userPaymentsRef = ref(database, `users/${userId}/payments`);
        const snapshot = await get(userPaymentsRef);
        const payments = snapshot.val() || [];

        return payments.some(payment => payment.courseTitle === course.title);
    } catch (error) {
        return false; // Treat errors as not paid
    }
};

const showPaymentModule = async (course) => {
    try {
        const { value: userDetails } = await Swal.fire({
            title: `Enroll in ${course.title}`,
            html: `
                <p>You are enrolling in: <strong>${course.title}</strong></p>
                <input id="swal-input-name" class="swal2-input" placeholder="Your Name">
                <input id="swal-input-email" class="swal2-input" placeholder="Email">
                <input id="swal-input-phone" class="swal2-input" placeholder="Phone Number">
                <label style="display: block; margin-top: 10px;">
                    <input type="checkbox" id="swal-input-confirm" class="swal2-checkbox">
                    I confirm that I want to enroll in this course.
                </label>
            `,
            showCloseButton: true,
            focusConfirm: false,
            preConfirm: () => {
                const name = document.getElementById('swal-input-name').value;
                const email = document.getElementById('swal-input-email').value;
                const phone = document.getElementById('swal-input-phone').value;
                const isConfirmed = document.getElementById('swal-input-confirm').checked;

                if (!name || !email || !phone) {
                    Swal.showValidationMessage(`Please enter all required details`);
                    return false;
                }

                if (!isConfirmed) {
                    Swal.showValidationMessage(`Please confirm your enrollment`);
                    return false;
                }

                return { name, email, phone };
            }
        });

        if (userDetails) {
            const paymentSuccess = await processPayment(course);
            if (paymentSuccess) {
                const paymentMethod = await selectPaymentMethod(course);

                if (paymentMethod === 'upi') {
                    await handleUPIPayment(course);
                } else if (paymentMethod === 'creditCard') {
                    await handleCreditCardPayment(course);
                }

                await enrollPaidCourse(course, userDetails);
            }
        }
    } catch (error) {
        console.error("Error during payment module:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'There was an issue with the payment process. Please try again later.',
            confirmButtonText: 'OK'
        });
    }
};

const navigateToSingleCourse = (courseTitle, courseCategory) => {
    // Store course details in localStorage
    localStorage.setItem("courseTitle", courseTitle);
    localStorage.setItem("courseCategory", courseCategory);

    // Navigate to the single course page
    window.location.href = "single-course.html";
};

const processPayment = async (course) => {
    const paymentConfirmed = await Swal.fire({
        title: 'Payment Confirmation',
        text: `Do you confirm to pay for ${course.title}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Pay Now!',
        cancelButtonText: 'Cancel'
    });

    return paymentConfirmed.isConfirmed;
};

const selectPaymentMethod = async (course) => {
    const { value: paymentMethod } = await Swal.fire({
        title: `Choose Payment Method for ${course.title}`,
        text: `Price: $${course.price}`,
        input: 'select',
        inputOptions: {
            'upi': 'UPI',
            'creditCard': 'Credit Card'
        },
        inputPlaceholder: 'Select a payment method',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return 'You need to select a payment method!';
            }
        }
    });

    return paymentMethod;
};

const handleUPIPayment = async (course) => {
    const { value: formValues } = await Swal.fire({
        title: `UPI Payment for ${course.title}`,
        text: `Price: $${course.price}`,
        html:
            `<img src="path_to_qr_code_image.png" alt="QR Code" style="width: 200px; height: 200px; margin-bottom: 20px;">
            <input id="swal-input-upi" class="swal2-input" placeholder="Enter UPI ID">
            <label style="display: block; margin-top: 10px;">
                <input type="checkbox" id="swal-input-confirm" class="swal2-checkbox">
                I confirm that I want to proceed with the payment.
            </label>`,
        focusConfirm: false,
        preConfirm: () => {
            const upiId = document.getElementById('swal-input-upi').value;
            const isConfirmed = document.getElementById('swal-input-confirm').checked;

            if (!upiId) {
                Swal.showValidationMessage(`Please enter your UPI ID`);
                return false;
            }

            if (!isConfirmed) {
                Swal.showValidationMessage(`Please confirm your payment`);
                return false;
            }

            return { upiId };
        },
        showCancelButton: true,
        cancelButtonText: 'Cancel'
    });

    if (formValues) {
        await completePayment(course, 'upi', formValues);
    }
};

const handleCreditCardPayment = async (course) => {
    const { value: formValues } = await Swal.fire({
        title: `Credit Card Payment for ${course.title}`,
        text: `Price: $${course.price}`,
        html:
            `<input id="swal-input-card" class="swal2-input" placeholder="Card Number">
            <input id="swal-input-expiry" class="swal2-input" placeholder="Expiry Date">
            <input id="swal-input-cvv" class="swal2-input" placeholder="CVV">
            <label style="display: block; margin-top: 10px;">
                <input type="checkbox" id="swal-input-confirm" class="swal2-checkbox">
                I confirm that I want to proceed with the payment.
            </label>`,
        focusConfirm: false,
        preConfirm: () => {
            const cardNumber = document.getElementById('swal-input-card').value;
            const expiryDate = document.getElementById('swal-input-expiry').value;
            const cvv = document.getElementById('swal-input-cvv').value;
            const isConfirmed = document.getElementById('swal-input-confirm').checked;

            if (!cardNumber || !expiryDate || !cvv) {
                Swal.showValidationMessage(`Please fill in all card details`);
                return false;
            }

            if (!isConfirmed) {
                Swal.showValidationMessage(`Please confirm your payment`);
                return false;
            }

            return { cardNumber, expiryDate, cvv };
        },
        showCancelButton: true,
        cancelButtonText: 'Cancel'
    });

    if (formValues) {
        await completePayment(course, 'creditCard', formValues);
    }
};

const completePayment = async (course, paymentMethod, formValues) => {
    try {
        if (paymentMethod === 'upi') {
            console.log(`Processing UPI payment for ${course.title} with UPI ID: ${formValues.upiId}`);
        } else if (paymentMethod === 'creditCard') {
            console.log(`Processing Credit Card payment for ${course.title} with Card: ${formValues.cardNumber}`);
        }

        await enrollPaidCourse(course, formValues);

        Swal.fire({
            icon: 'success',
            title: 'Payment Successful!',
            text: `You have successfully enrolled in ${course.title} and your payment has been processed.`,
            confirmButtonText: 'OK'
        });
    } catch (error) {
        console.error("Payment processing failed:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'There was an issue with the payment process. Please try again later.',
            confirmButtonText: 'OK'
        });
    }
};

const enrollPaidCourse = async (course, userDetails) => {
    try {
        const userCoursesRef = ref(database, `users/${userId}/enrolledCourses`);
        const userPaymentsRef = ref(database, `users/${userId}/payments`);

        const enrolledCoursesSnapshot = await get(userCoursesRef);
        let enrolledCourses = enrolledCoursesSnapshot.val() || [];

        const paymentsSnapshot = await get(userPaymentsRef);
        let payments = paymentsSnapshot.val() || [];

        enrolledCourses.push({
            id: course.id,
            title: course.title,
            category: course.category,
            type: course.type,
            price: course.price || 'Free',
            enrolledOn: new Date().toISOString(),
            email: userDetails.email,
            phone: userDetails.phone,
            name: userDetails.name
        });

        payments.push({
            courseId: course.id,
            courseTitle: course.title,
            amount: course.price,
            paidOn: new Date().toISOString()
        });

        await set(userCoursesRef, enrolledCourses);
        await set(userPaymentsRef, payments);

        await Swal.fire({
            icon: 'success',
            title: 'Enrolled and Payment Successful!',
            text: `You have successfully enrolled in ${course.title} and your payment was processed.`,
            confirmButtonText: 'OK'
        });

    } catch (error) {
        console.error("Error enrolling in paid course:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `There was an issue enrolling in the course or processing payment: ${error.message}`,
            confirmButtonText: 'OK'
        });
    }
};