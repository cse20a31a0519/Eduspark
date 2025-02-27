document.addEventListener("DOMContentLoaded", () => {
    const courseTitle = localStorage.getItem("courseTitle");
    const courseCategory = localStorage.getItem("courseCategory");

    if (!courseTitle || !courseCategory) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Course details not found.",
        });
        return;
    }

    document.getElementById("course-title").innerText = courseTitle;

    fetchCourseDetails(courseTitle, courseCategory);

    document.getElementById("back-to-courses").addEventListener("click", () => {
        window.location.href = "Home.html";
    });
});

const fetchCourseDetails = async (title, category) => {
    try {
        const response = await fetch(`https://index-16f53-default-rtdb.firebaseio.com/admin/courses/${category}.json`);
        const coursesData = await response.json();

        console.log("Fetched courses data:", coursesData); // Log the fetched data

        const course = Object.values(coursesData).find(c => c.title === title);

        if (course) {
            console.log("Found course:", course); // Log the found course
            displayCourseDetails(course);
            if (course.video_links && course.video_links.length > 0) {
                playVideo(course.video_links[0].url); // Play the first video by default
            }
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Course not found.",
            });
        }
    } catch (error) {
        console.error("Error fetching course details:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch course details.",
        });
    }
};

const displayCourseDetails = (course) => {
    const videoList = document.getElementById("video-list");
    videoList.innerHTML = "";

    if (course.video_links && Array.isArray(course.video_links)) {
        course.video_links.forEach((video, index) => {
            const videoItem = document.createElement("div");
            videoItem.className = "video-item list-group-item list-group-item-action d-flex justify-content-between align-items-center";
            videoItem.innerHTML = `
                <div>
                    <h5>Course Title: ${video.title}</h5>
                </div>
                <div class="btn-group gap-10">
                    <button class="btn btn-primary me-2 " onclick="playVideo('${video.url}')">Play</button>
                    <button class="btn btn-warning me-2" onclick="addToWatchLater('${video.url}', '${video.title}', '${course.title}')">Watch Later</button>
                    <button class="btn btn-success" onclick="markAsComplete(this)">Complete</button>
                </div>
            `;
            videoList.appendChild(videoItem);
        });
    } else {
        videoList.innerHTML = "<p>No videos available for this course.</p>";
    }
};

const playVideo = (url) => {
    console.log("Playing video:", url); // Log the video URL
    const videoPlayer = document.getElementById("video-player");
    videoPlayer.innerHTML = `
        <iframe width="100%" height="800" src="${url.replace("watch?v=", "embed/")}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
    `;
};

const addToWatchLater = async (url, title, courseTitle) => {
    const userId = localStorage.getItem("userid"); // Use "userid" instead of "userId"
    if (!userId) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "User not logged in.",
        });
        return;
    }

    // Fetch existing watch later data
    const watchLaterResponse = await fetch(`https://index-16f53-default-rtdb.firebaseio.com/users/${userId}/watchLater.json`);
    const watchLaterData = await watchLaterResponse.json();

    // Check if video already exists in watch later
    if (watchLaterData && Object.values(watchLaterData).some(video => video.url === url)) {
        Swal.fire({
            icon: "warning",
            title: "Already Added",
            text: "This video is already in your Watch Later list.",
        });
        return;
    }

    const watchLaterItem = {
        url,
        title,
        courseTitle,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(`https://index-16f53-default-rtdb.firebaseio.com/users/${userId}/watchLater.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(watchLaterItem)
        });

        if (response.ok) {
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Added to Watch Later!",
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to add to Watch Later.",
            });
        }
    } catch (error) {
        console.error("Error adding to Watch Later:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to add to Watch Later.",
        });
    }
};

let progress = 0;

const markAsComplete = (button) => {
    if (progress < 100) {
        progress += 10;
        const progressBar = document.getElementById("progress-bar");
        progressBar.style.width = `${progress}%`;
        progressBar.innerText = `${progress}%`;

        if (progress === 100) {
            const generateCertificateBtn = document.getElementById("generate-certificate");
            generateCertificateBtn.disabled = false;
        }

        // Disable the clicked "Complete" button
        button.disabled = true;
    }
};

document.getElementById("generate-certificate").addEventListener("click", async () => {
    const userId = localStorage.getItem("userid");
    const courseTitle = localStorage.getItem("courseTitle");
    const userName = localStorage.getItem("userName");

    // Debugging logs
    console.log("User ID:", userId);
    console.log("Course Title:", courseTitle);
    console.log("User Name:", userName);

    if (!userId || !courseTitle || !userName) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "User or course details not found.",
        });
        return;
    }

    // Fetch existing certificates for the user
    const certificatesResponse = await fetch(`https://index-16f53-default-rtdb.firebaseio.com/users/${userId}/certificates.json`);
    const certificatesData = await certificatesResponse.json();

    // Check if certificate already exists for this course
    if (certificatesData && Object.values(certificatesData).some(cert => cert.courseTitle === courseTitle)) {
        Swal.fire({
            icon: "warning",
            title: "Already Generated",
            text: "Certificate already generated for this course.",
        });
        return;
    }

    // Generate certificate
    const certificateData = {
        courseTitle,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(`https://index-16f53-default-rtdb.firebaseio.com/users/${userId}/certificates.json`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(certificateData)
        });

        if (response.ok) {
            Swal.fire({
                icon: "success",
                title: "Success",
                text: "Certificate generated successfully!",
                confirmButtonText: "OK"
            }).then(() => {
                window.location.href = `certificate.html?courseName=${encodeURIComponent(courseTitle)}&studentName=${encodeURIComponent(userName)}`;
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to generate certificate.",
            });
        }
    } catch (error) {
        console.error("Error generating certificate:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to generate certificate.",
        });
    }
});