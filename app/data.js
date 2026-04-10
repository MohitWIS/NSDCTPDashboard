ZOHO.CREATOR.UTIL.getInitParams().then(function (response) {
    console.log(response);
    //getUserGeoCords(response,position);
    //getEmployees();
    var tpid = "TP99580";

    getuserDetails("wlplnsdc@gmail.com");
});




function goToSection(id) {
    document.getElementById(id).scrollIntoView({
        behavior: 'smooth'
    });
}

function goToSection(id) {
    document.getElementById(id).scrollIntoView({
        behavior: 'smooth'
    });
}

function goToSection(id) {
    document.getElementById(id).scrollIntoView({
        behavior: 'smooth'
    });
}


function goToSection(id) {
    document.getElementById(id).scrollIntoView({
        behavior: 'smooth'
    });
}

function showTab(tab) {
    const notices = document.getElementById("notices-section");
    const guidelines = document.getElementById("guidelines-section");
    const tabs = document.querySelectorAll(".tab");

    // Reset active tab
    tabs.forEach(t => t.classList.remove("active"));

    if (tab === "notices") {
        notices.style.display = "block";
        guidelines.style.display = "none";
        tabs[0].classList.add("active");
    } else {
        notices.style.display = "none";
        guidelines.style.display = "block";
        tabs[1].classList.add("active");
    }
}

// Close when clicking outside
window.onclick = function (e) {
    if (!e.target.matches('.dropdown-btn')) {
        document.getElementById("dropdownMenu").classList.remove("show");
    } else {
        document.getElementById("dropdownMenu").classList.toggle("show");
    }
}

function selectOption(el) {
    document.querySelectorAll(".dropdown-item").forEach(i => i.classList.remove("active"));
    el.classList.add("active");

    document.getElementById("dropdownBtn").innerText = el.innerText + " ▼";
    document.getElementById("dropdownMenu").classList.remove("show");
}




function getAnnouncements(tpid) {
    // 🔹 Step 1: Get occupied employees
    var config1 = {
        app_name: "customer-management-account",
        report_name: "Announcements_Subform_Report",
    };
    const tId = tpid;
    ZOHO.CREATOR.DATA.getRecords(config1).then(function (res) {
        //console.log(res.data)
        var data = res.data;
        const announcements = [];

        // 🔹 Step 1: Convert API data → array (with link inside text)
        data.forEach(item => {
            //console.log(item);
            if (tId == item.Training_Partner_ID) {
                let text = item.Announcement || "No Announcement";
                let link = item.Document_Link || "";

                let formattedText = `📢 ${text}`;

                // If link exists → embed inside text
                if (link) {
                    formattedText += ` <a href="${link}" target="_blank">Click Here</a>`;
                }

                announcements.push(formattedText);
            }

        });

        // 🔹 Step 2: Render into DOM
        const track = document.getElementById("tickerTrack");
        track.innerHTML = ""; // clear first
        //console.log(announcements);
        announcements.forEach(item => {
            const div = document.createElement("div");
            div.className = "announcement-card"; // keep your design
            div.innerHTML = item; // supports HTML (links)
            track.appendChild(div);
        });

        // 🔁 Step 3: Duplicate for infinite scroll
        track.innerHTML += track.innerHTML;

    });
}

function openLink(url) {
    window.open(url, '_blank');
}
function getuserDetails(tpid) {
    //
    var config1 = {
        app_name: "customer-management-account",
        report_name: "CMA_Report",
        //criteria: "TP_SPOC_Email_ID_for_regular_communication == " + tpid
        criteria: "(TP_SPOC_Email_ID_for_regular_communication == \"" + tpid + "\")"
    };
    //console.log(config1);
    //const tId = tpid;
    ZOHO.CREATOR.DATA.getRecords(config1).then(function (res) {
        //console.log(res.data[0].TP_ID);
        document.getElementById("tpId").innerText = "TP ID: " + (res.data[0].TP_ID || "-");
        document.getElementById("tpName").innerText = "TP Name: " + (res.data[0].TP_Name || "-");
        getAnnouncements(res.data[0].TP_ID);
        getOperationalSupport(res.data[0].TP_ID);
        getSocialPerformance("TP000249");
        getInformationHub();
    });
}

function getInformationHub() {
    var config1 = {
        app_name: "customer-management-account",
        report_name: "Copy_of_All_Information_Hubs",
    };

    ZOHO.CREATOR.DATA.getRecords(config1).then(function (res) {
        //console.log(res);
        var data = res.data[0];

        var links = {
            onboarding: data.Onboarding_SOP_Link,
            operational: data.Operational_Guidelines_Link,
            agreement: data.Agreement_Renewal_Process_Link,
            sidh: data.SIDH_Process_Flow1,
            monitoring: data.Monitoring_Guidelines_Link,
            other: data.Other_Reference_Documents_Link
        };
        Object.keys(links).forEach(function (key) {

            var el = document.getElementById(key);
            var url = links[key];

            if (el && url) {
                el.onclick = function () {
                    window.open(url, '_blank');
                };
            }
        });
    });
}

function getOperationalSupport(tpId) {
    var config1 = {
        app_name: "customer-management-account",
        report_name: "Zoho_Desk_Report",
        //criteria: "TP_SPOC_Email_ID_for_regular_communication == " + tpid
        //criteria: "(TP_SPOC_Email_ID_for_regular_communication == \"" + tpid + "\")"
    };
    //console.log(config1);
    const tId = tpId;
    ZOHO.CREATOR.DATA.getRecords(config1).then(function (res) {
        var data = res.data;
        var html = "";
        data.forEach(item => {
            //console.log(item["Record_ID.Training_Partner_ID"]?.TP_ID);
            if (tId == item.Training_Partner_ID1.TP_ID) {
                //console.log(item);

                var ticketId = item.Ticket_ID || "-";
                var createdOn = item.Date_field || "-";
                var subject = item.subject_1 || "-";
                var response = item.Response || "-";
                var status = item.Status || "-";
                html += `
                <tr>
                    <td><a href="#">#${ticketId}</a></td>
                    <td>${formatDate(createdOn)}</td>
                    <td>${subject}</td>
                    <td>${response}</td>
                    <td><span class="status ${status}">${status}</span></td>
                </tr>
                `;
            }

            //var statusClass = status.toLowerCase() === "open" ? "open" : "closed";


        });

        document.getElementById("ticketTableBody").innerHTML = html;

    });
}


function formatDate(dateStr) {
    if (!dateStr) return "-";

    var date = new Date(dateStr);

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}

function getSocialPerformance(tpId) {
    var config1 = {
        app_name: "customer-management-account",
        report_name: "CMA_Report",
        criteria: "(TP_ID == \"" + tpId + "\")"
    };
    const tId = tpId;
    ZOHO.CREATOR.DATA.getRecords(config1).then(function (res) {

        var data = res.data;
        var html = "";
        var fyList = [
            "Financial Year 2023-24",
            "Financial Year 2024-25",
            "Financial Year 2025-26"
        ];
        data.forEach(item => {
            if (tId == item.TP_ID) {
                //console.log(item);
                var tpId = item.TP_ID || "-";
                var tpName = item.TP_Name || "-";
                // var fy = item.Target_FY_2025_26 || "-";
                // var enrolled = item.Enrolled_FY_2022_23 || "0";
                // var trained = item.Trained_FY_2022_23 || "0";
                // var certified = item.Certified_Count || "0";
                // var placed = item.Placed_Count || "0";


                for (var j = 0; j < fyList.length; j++) {

                    var fy = fyList[j];

                    // 👇 You can map values based on FY (custom logic)
                    var enrolled = "0";
                    var trained = "0";
                    var certified = "0";
                    var placed = "0";

                    if (j == 0) {
                        var enrolled = item.Enrolment_2023_24 || "0";
                        var trained = item.Trained_FY_2023_24 || "0";
                        var certified = "0";
                        var placed = "0";
                    } else if (j == 1) {
                        var enrolled = item.Enrolment_2024_25 || "0";
                        var trained = item.Trained_FY_2024_25 || "0";
                        var certified = "0";
                        var placed = "0";
                    } else {
                        var enrolled = item.Certified_Count || "0";
                        var trained = item.Enrolled_Count || "0";
                        var certified = item.Trained_Count || "0";
                        var placed = item.Placed_Count || "0";
                    }

                    html += `
                        <tr>
                            <td>${tpId}</td>
                            <td>${tpName}</td>
                            <td>${fy}</td>
                            <td>${enrolled}</td>
                            <td>${trained}</td>
                            <td>${certified}</td>
                            <td>${placed}</td>
                        </tr>
                    `;
                }
            }
        });

        if (data.length === 0) {
            html = `<tr><td colspan="7">No data available</td></tr>`;
        }

        document.getElementById("dashboardTableBody").innerHTML = html;
    });
}