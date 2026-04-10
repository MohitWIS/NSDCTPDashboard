var noticesData = [];
var guidelinesData = [];

let currentCategory = '';
let currentSearch = '';
let currentGuidelineSearch = '';
let currentGuidelineCategory = '';
let debounceTimer;
var IsDevelopment = false;
var partnerDocument_certLink;
var Agreement_Document_certLink;
var Term_Sheet_Document_certLink;
var Tp_ID = "";
var Tp_Name="";

document.getElementById("noticeSearchInput").addEventListener("input", function () {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        currentSearch = this.value.trim();
        renderNotices();
    }, 300);
});

document.getElementById("guidelineSearchInput").addEventListener("input", function () {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        currentGuidelineSearch = this.value.trim();
        renderGuidelines();
    }, 300);
});

function onCategoryChange(value) {
    currentCategory = value;
    renderNotices();
}

function onGuidelineCategoryChange(value) {
    currentGuidelineCategory = value;
    renderGuidelines();
}


ZOHO.CREATOR.UTIL.getInitParams().then(function (response) {
    console.log(response);
    if (response.envUrlFragment != "/environment/development") {
        getuserDetails(response.loginUser);
    } else {
        IsDevelopment = true;
        getuserDetails("wlplnsdc@gmail.com");
    }

});

function openCMA() {
    if (IsDevelopment) {
        window.open("https://creatorapp.zoho.in/itzoho_nsdcindia/environment/development/customer-management-account/#Page:Training_User_Profile", "_blank");
    } else {
        window.open("https://creatorapp.zoho.in/itzoho_nsdcindia/customer-management-account/#Page:Training_User_Profile", "_blank");
    }

}

function getuserDetails(tpid) {
    var config1 = {
        app_name: "customer-management-account",
        report_name: "Copy_of_CMA_Report",
        criteria: "(TP_SPOC_Email_ID_for_regular_communication == \"" + tpid + "\")"
    };
    ZOHO.CREATOR.DATA.getRecords(config1).then(function (res) {
        let tpId = res.data[0].TP_ID || "-";
        document.getElementById("tpId").innerText = Tp_ID = tpId;
        document.getElementById("tpName").innerText = Tp_Name = (res.data[0].TP_Name || "-");
        getAnnouncements(tpId);
        getOperationalSupport(tpId);
        getSocialPerformance(tpId);
        loadNotices();
        getInformationHub();
        getPartnerDocuments(tpId);
        getOtherDocs(tpId);
        getNotifications(tpId);
    });
}

function getNotifications(tpId) {
    const container = document.getElementById("dropdownMenu");
    container.innerHTML = ""; // clear old items
    var config1 = {
        app_name: "customer-management-account",
        report_name: "All_Notifications",
        criteria: "(Mark_as_Read == false && Training_Partner_ID == \"" + tpId + "\")"

    };
    ZOHO.CREATOR.DATA.getRecords(config1).then(function (res) {


        if (res.code == 3000) {
            var data = res.data;
            console.log(data);

            if (data.length === 0) {
                document.getElementById("notification_count").style.visibility = "hidden";
                container.innerHTML = `<div class="dropdown-item">No new notifications</div>`;
                return;
            }
            document.getElementById("notification_count").innerText = data.length;
            document.getElementById("notification_count").style.visibility = "visible";

            data.forEach(item => {
                const div = document.createElement("div");
                div.className = "dropdown-item";
                div.innerHTML = `
                        <h5>${item.Notification}</h5>
                        <small style="float: right;">${item.Date_field}</small>
                    `;
                container.appendChild(div);
            });

            // Add "Mark All Read" button
            const btn = document.createElement("div");
            btn.className = "dropdown-item";
            btn.style.textAlign = "center";
            btn.style.fontWeight = "bold";
            btn.style.cursor = "pointer";
            btn.innerText = "Mark All Read";
            btn.onclick = function () {
                markAllRead(data);
            };

            container.appendChild(btn);
        } else {
            container.innerHTML = `<div class="dropdown-item">No new notifications</div>`;
        }
    }).catch(function (error) {
        console.error("Error fetching notifications", error);

        document.getElementById("notification_count").style.visibility = "hidden";
        container.innerHTML = `<div class="dropdown-item">No new notifications</div>`;
    });
}

function markAllRead(data) {

    const updatePromises = data.map(item => {

        var config = {
            app_name: "customer-management-account",
            report_name: "All_Notifications",
            id: item.ID,
            payload: {
                data: {
                    Mark_as_Read: true
                }
            }
        };

        return ZOHO.CREATOR.DATA.updateRecordById(config);
    });

    Promise.all(updatePromises)
        .then(responses => {
            console.log("All notifications marked as read", responses);

            // Refresh notifications
            getNotifications();
        })
        .catch(error => {
            console.error("Error updating records", error);
        });
}

function getOtherDocs(tpId) {
    const config = {
        app_name: "customer-management-account",
        report_name: "Copy_of_CMA_Report",
        criteria: "(TP_ID == \"" + tpId + "\")"
    };
    ZOHO.CREATOR.DATA.getRecords(config).then(function (res) {
        const data = res.data;
        const latestRecord = data[data.length - 1];
        console.log(latestRecord);
        Agreement_Document_certLink = latestRecord.Agreement_URL1;
        Term_Sheet_Document_certLink = latestRecord.Term_Sheet_URL1;
    });
}


function getPartnerDocuments(tpId) {
    const config = {
        app_name: "customer-management-account",
        report_name: "All_Mlp_Data",
        criteria: "(Training_Partner_ID == \"" + tpId + "\" && Invoice_sent_to_TP == true)"
    };
    ZOHO.CREATOR.DATA.getRecords(config).then(function (res) {
        if (res.code != 3000) {
            document.getElementById("invoiceTableBody").innerHTML = `<tr><td colspan="6">No invoices found</td></tr>`;
            return;
        }
        const data = res.data;
        const latestRecord = data[data.length - 1];
        //console.log(latestRecord);
        partnerDocument_certLink = latestRecord.Certificate_Link;



        console.log(data);

        var html = "";

        for (var i = 0; i < data.length; i++) {

            var item = data[i];

            var quarter = item.Quarter || "-";
            var amount = item.Invoice_Amount || "0";
            var status = item.Status || "-";
            var dueDate = item.Due_Date;


            // Status styling
            var statusClass = status.toLowerCase() === "paid" ? "closed" : "open";

            html += `
            <tr>
                <td data-label="Quarter">${quarter}</td>
                <td data-label="Invoice">-</td>
                <td data-label="Due Date">${dueDate}</td>
                <td data-label="Amount" class="amount">₹ ${amount}</td>
                <td data-label="Status">
                    <span class=" status ${statusClass}">${status}</span>
                </td>
                <td data-label="Action" class="action" onclick='downLoadQuarterlyInvoice("${item.Invoice || ''}", "${item.Working || ''}")'>
                    <img src="Icon/download_grey.svg" alt="Download"> Download
                </td>
            </tr>
        `;
        }

        // Handle empty data
        if (data.length === 0) {
            html = `<tr><td colspan="6">No invoices found</td></tr>`;
        }

        document.getElementById("invoiceTableBody").innerHTML = html;
    }).catch(function (error) {
        console.error("Error fetching All_Mlp_Data", error);
        document.getElementById("invoiceTableBody").innerHTML = `<tr><td colspan="6" style="text-align: center; font-size: large;   font-weight: bold;">No invoices found</td></tr>`;
    });
}

function convertToDownloadAuthUrl(viewUrl) {

    // Extract file ID (last part of URL)
    var fileId = viewUrl.split("/file/")[1];

    // Create new API URL
    var apiUrl = `https://workdrive.zohoexternal.in/public/api/v1/downloadauth/${fileId}`;

    return apiUrl;
}

function downLoadQuarterlyInvoice(invoice, working) {
    if (invoice) {
        const invoiceLink = "https://creatorapp.zoho.in" + invoice;
        window.open(invoiceLink, '_blank');
    }
    if (working) {
        const workingLink = "https://creatorapp.zoho.in" + working;
        window.open(workingLink, '_blank');
    }
}

function filterNoticeList() {
    const filterValue = document.getElementById("noticeSearchInput").value.trim();
    getNotices(filterValue);

}

function loadNotices() {

    const config = {
        app_name: "customer-management-account",
        report_name: "Notices_Subform_Report"
    };

    ZOHO.CREATOR.DATA.getRecords(config).then(function (res) {

        noticesData = res.data || [];
        console.log("Fetched notices:", noticesData);
        renderNotices(); // initial render
    });
}

function loadGuidelines() {

    const config = {
        app_name: "customer-management-account",
        report_name: "Guidelines_Subform_Report"
    };
    ZOHO.CREATOR.DATA.getRecords(config).then(function (res) {
        guidelinesData = res.data || [];
        console.log("Fetched guidelinesData:", guidelinesData);
        renderGuidelines(); // initial render
    });
}

function renderGuidelines() {
    const container = document.getElementById("guidelineCardContainer");
    container.innerHTML = "";

    let filteredData = guidelinesData;

    // ✅ Category filter
    if (currentGuidelineCategory) {
        filteredData = filteredData.filter(item =>
            item.Category === currentGuidelineCategory
        );
    }

    // ✅ Search filter (case-insensitive)
    if (currentGuidelineSearch) {
        const search = currentGuidelineSearch.toLowerCase();

        filteredData = filteredData.filter(item =>
            (item.Training_Partner_Name || '')
                .toLowerCase()
                .includes(search)
        );
    }


    filteredData.forEach(item => {

        const downloadHTML = item.Document_Link
            ? `<span  style="cursor:pointer" onclick='downloadFiles(${JSON.stringify(item.Document_Link)})'>
                <img src="Icon/download_Blue.svg" alt="Download">
                ${item.Document_Upload?.length || 0} files
            </span>`
            : "";
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <h3>${item.Training_Partner_Name || 'N/A'}</h3>
            
            <span class="tag">${item.Category || 'General'}</span>
            
            <p>${item.Guideline ? item.Guideline : ''}</p>
            
            <div class="meta">
            <span>
                <img src="Icon/calendar.svg" alt="Calendar"/>
                Updated ${item.Date_field || ''}
            </span>

            ${downloadHTML}
            
            
            </div>
        `;

        container.appendChild(card);
    });
}

function renderNotices() {

    const container = document.getElementById("noticeList");
    container.innerHTML = "";

    let filteredData = noticesData;

    // ✅ Category filter
    if (currentCategory) {
        filteredData = filteredData.filter(item =>
            item.Category === currentCategory
        );
    }

    // ✅ Search filter (case-insensitive)
    if (currentSearch) {
        const search = currentSearch.toLowerCase();

        filteredData = filteredData.filter(item =>
            (item.Training_Partner_Name || '')
                .toLowerCase()
                .includes(search)
        );
    }

    // ✅ Render
    filteredData.forEach(item => {

        const li = document.createElement("li");

        li.innerHTML = `
            <div class="card notice">
            
            <div class="card-top">
                <h3>${item.Training_Partner_Name || 'Notice Title'}</h3>
                <span class="badge">${item.Priority || ''}</span>
            </div>

            <p>${item.Notice || ''}</p>

            <div class="meta">
                <span>
                    <img src="Icon/calendar.svg" />
                    ${item.Date_field || ''}
                </span>

                <span>
                    <img src="Icon/tag.svg" />
                    ${item.Category || ''}
                </span>

                ${item.Document_Link
                ? `<span style="cursor:pointer"
                            onclick="downloadFiles('${item.Document_Link}')">
                        <img src="Icon/download_Blue.svg" />
                        Download
                    </span>`
                : ''
            }
            </div>

            </div>
        `;

        container.appendChild(li);
    });

    // ✅ Optional: No data message
    if (filteredData.length === 0) {
        container.innerHTML = `<p style="text-align:center;">No notices found</p>`;
    }
}

function downloadAllDoc() {
    const activeTab = document.querySelector(".tab.active");

    if (activeTab) {
        if (activeTab.innerText.includes("Notices")) {
            console.log("Notices active");
            noticesData.forEach(element => {
                if (element.Document_Link) {
                    downloadFiles(element.Document_Link);
                }
            });
        } else if (activeTab.innerText.includes("Guidelines")) {
            console.log("Guidelines active");
            guidelinesData.forEach(element => {
                if (element.Document_Link) {
                    downloadFiles(element.Document_Link);
                }
            });
        }
    }

}

function getGuidelines(filterValue) {
    const config = {
        app_name: "customer-management-account",
        report_name: "Guidelines_Subform_Report",
        criteria: filterValue ? `Category == "${filterValue}"` : undefined
    };
    ZOHO.CREATOR.DATA.getRecords(config).then(function (res) {
        // Handle guidelines data
        console.log("Guidelines:", res.data);
        const data = guidelinesData = res.data;
        const container = document.getElementById("guidelineCardContainer");
        container.innerHTML = "";

        data.forEach(item => {

            const downloadHTML = item.Document_Link
                ? `<span  style="cursor:pointer" onclick='downloadFiles(${JSON.stringify(item.Document_Link)})'>
                <img src="Icon/download_Blue.svg" alt="Download">
                ${item.Document_Link?.length || 0} files
            </span>`
                : "";
            const card = document.createElement("div");
            card.className = "card";

            card.innerHTML = `
            <h3>${item.Training_Partner_Name || 'N/A'}</h3>
            
            <span class="tag">${item.Category || 'General'}</span>
            
            <p>${item.Guideline ? item.Guideline : ''}</p>
            
            <div class="meta">
            <span>
                <img src="Icon/calendar.svg" alt="Calendar"/>
                Updated ${item.Date_field || ''}
            </span>

            ${downloadHTML}
            
            
            </div>
        `;

            container.appendChild(card);
        });
    });
}
function downloadFiles(files) {
    if (!files) {
        alert("No files available");
        return;
    }

    let fileArray = [];

    // ✅ Case 1: Already an array
    if (Array.isArray(files)) {
        fileArray = files;
    }
    // ✅ Case 2: Comma-separated string
    else if (typeof files === "string" && files.includes(",")) {
        fileArray = files.split(",").map(f => f.trim());
    }
    // ✅ Case 3: Single string / object
    else {
        fileArray = [files];
    }

    if (fileArray.length === 0) {
        alert("No files available");
        return;
    }

    fileArray.forEach((file, index) => {


        if (!file) return;

        var fileId = file.split("/file/")[1];

        let url = `https://files-accl.zohoexternal.in/public/workdrive-external/download/${fileId}`;

        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        document.body.appendChild(link);

        // ⏱️ Delay to avoid browser blocking multiple downloads
        setTimeout(() => {
            link.click();
            document.body.removeChild(link);
        }, index * 300);
    });
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
        report_name: "Copy_of_CMA_Report",
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

function openLink(url) {
    window.open(url, '_blank');
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
        loadNotices();
    } else {
        notices.style.display = "none";
        guidelines.style.display = "block";
        tabs[1].classList.add("active");
        loadGuidelines();
    }
}

var partnerDocument_docType = "";
var partnerDocument_actionType = "";

function partnerDocumentAction(docType, actionType) {
    partnerDocument_docType = docType;
    partnerDocument_actionType = actionType;
    openPopup();


}

function openPopup() {
    document.getElementById("passwordModal").style.display = "flex";
}

function closePopup() {
    document.getElementById("passwordModal").style.display = "none";
}

function checkPassword() {
    const input = document.getElementById("passwordInput").value;
    if (input ===  Tp_Name.substring(0, 4) + Tp_ID.substring(0, 4)) { 
        closePopup();
        performActionOnDocument();
    } else {
        const error = document.getElementById("errorMsg");
        error.textContent = "Wrong password!";
    }
}

function performActionOnDocument() {
    if (partnerDocument_docType === 'Partnership-Certificate') {
        if (partnerDocument_certLink) {
            if (partnerDocument_actionType === 'viewBtn') {
                window.open(partnerDocument_certLink, '_blank');
            } else if (partnerDocument_actionType === 'downloadBtn') {
                const fileId = partnerDocument_certLink.split("/file/")[1];

                const url = `https://files-accl.zohoexternal.in/public/workdrive-external/download/${fileId}`;

                window.open(url, '_blank');
            }
        }
    } else if (docType === 'Agreement-Document') {
        if (Agreement_Document_certLink) {
            if (partnerDocument_actionType === 'viewBtn') {
                window.open(Agreement_Document_certLink, '_blank');
            } else if (partnerDocument_actionType === 'downloadBtn') {
                const fileId = Agreement_Document_certLink.split("/file/")[1];

                const url = `https://files-accl.zohoexternal.in/public/workdrive-external/download/${fileId}`;
                window.open(url, '_blank');

            }
        }
    } else if (docType === 'Term-sheet') {
        if (Term_Sheet_Document_certLink) {
            if (partnerDocument_actionType === 'viewBtn') {
                window.open(Term_Sheet_Document_certLink, '_blank');
            } else if (partnerDocument_actionType === 'downloadBtn') {
                const fileId = Term_Sheet_Document_certLink.split("/file/")[1];

                const url = `https://files-accl.zohoexternal.in/public/workdrive-external/download/${fileId}`;
                window.open(url, '_blank');
            }
        }
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

