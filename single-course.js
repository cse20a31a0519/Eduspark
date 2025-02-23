document.addEventListener("DOMContentLoaded", () => {
    const courseTitle = localStorage.getItem("courseTitle");
    const courseCategory = localStorage.getItem("courseCategory");

    if (!courseTitle || !courseCategory) {
        alert("Course details not found.");
        return;
    }

    document.getElementById("course-title").innerText = courseTitle;

    fetchCourseDetails(courseTitle, courseCategory);
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
            alert("Course not found.");
        }
    } catch (error) {
        console.error("Error fetching course details:", error);
    }
};

const displayCourseDetails = (course) => {
    const videoList = document.getElementById("video-list");
    videoList.innerHTML = "";

    if (course.video_links && Array.isArray(course.video_links)) {
        course.video_links.forEach(video => {
            const videoItem = document.createElement("div");
            videoItem.className = "video-item list-group-item list-group-item-action";
            videoItem.innerHTML = `
                <h5>${video.title}</h5>
                <button class="btn btn-primary" onclick="playVideo('${video.url}')">Play</button>
                <a class="btn btn-secondary" href="${video.url}" download>Download</a>
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