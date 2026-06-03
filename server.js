const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Backend Endpoint: Single Result Fetch Logic
app.get('/get-result', async (req, res) => {
    const { roll_code, roll_no } = req.query;
    try {
        const url = `https://resultapi.biharboardonline.org/result?roll_code=${roll_code}&roll_no=${roll_no}`;
        const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Main Dashboard UI
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BSEB - Bulk Class Result Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; color: #1e293b; }
        
        /* MULTI-STRATEGY 1-PAGE MARKSHEET & FULL LIST PRINT ARCHITECTURE */
        @media print {

    @media print {

    @page {
        size: A4;
        margin: 5mm;
    }

    /* Default = LIST PRINT */
    body:not(.print-marksheet) #mainDashboard,
    body:not(.print-marksheet) #mainDashboard * {
        visibility: visible !important;
    }

    body:not(.print-marksheet) #mainDashboard {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
    }

    /* MARKSHEET PRINT ONLY */
    body.print-marksheet * {
        visibility: hidden !important;
    }

    body.print-marksheet #printableMarksheetArea,
    body.print-marksheet #printableMarksheetArea * {
        visibility: visible !important;
    }

    body.print-marksheet #printableMarksheetArea {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
       
    }
}
    #printableMarksheetArea {
}
    .no-print {
        display: none !important;
    }
}
    </style>
</head>
<body class="p-3 md:p-8">

    <div id="mainDashboard" class="max-w-7xl mx-auto bg-white shadow-md rounded-xl overflow-hidden">
        <div class="p-6 bg-slate-900 text-white flex flex-col items-center text-center border-b-4 border-blue-600 no-print">
            <h1 class="text-xl md:text-3xl font-extrabold tracking-tight text-blue-400">BIHAR SCHOOL EXAMINATION BOARD, PATNA</h1>
            <p class="text-sm md:text-lg font-medium text-slate-300 mt-1">Bulk Class Result & Analytics Dashboard (2026)</p>
        </div>

        <div class="hidden print:block text-center border-b-2 border-slate-800 pb-3 mb-4">
            <h1 class="text-2xl font-bold tracking-tight text-slate-900">BIHAR SCHOOL EXAMINATION BOARD, PATNA</h1>
            <p class="text-sm font-semibold text-slate-600">Student Wise Performance Register</p>
        </div>

        <div class="p-4 md:p-6 bg-slate-50 border-b no-print">
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-2">Roll Code</label>
                    <input type="text" id="rollCode" value="53341" placeholder="e.g. 53341" class="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-500 font-semibold text-slate-700">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-2">From Roll No.</label>
                    <input type="number" id="startRoll" value="2600001" placeholder="e.g. 2600001" class="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-500 font-semibold text-slate-700">
                </div>
                <div>
                    <label class="block text-xs font-bold text-slate-600 uppercase mb-2">To Roll No.</label>
                    <input type="number" id="endRoll" value="2600010" placeholder="e.g. 2600099" class="w-full border border-slate-300 p-2.5 rounded-lg outline-none focus:border-blue-500 font-semibold text-slate-700">
                </div>
                <div>
                    <button onclick="fetchBulkResults()" id="searchBtn" class="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-bold tracking-wide transition flex items-center justify-center gap-2 shadow-sm">
                        <i class="fa-solid fa-bolt"></i> Fetch Class Data
                    </button>
                </div>
            </div>
            
            <div id="progressContainer" class="hidden mt-5">
                <div class="flex justify-between text-xs font-bold text-slate-500 mb-1">
                    <span id="progressText">Processing...</span>
                    <span id="progressPercent">0%</span>
                </div>
                <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div id="progressBar" class="bg-blue-600 h-2 w-0 transition-all duration-200"></div>
                </div>
            </div>
        </div>

        <div id="statsPanel" class="hidden p-4 md:p-6 bg-white border-b grid grid-cols-2 md:grid-cols-5 gap-3 no-print">
            <button onclick="filterResults('ALL')" id="tab-ALL" class="filter-tab p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-xl text-center ring-2 ring-blue-500">
                <span class="block text-[10px] md:text-xs font-bold text-slate-500 uppercase">Total Checked</span>
                <span id="countTotal" class="text-xl md:text-2xl font-black text-blue-700">0</span>
            </button>
            <button onclick="filterResults('1ST DIVISION')" id="tab-1ST" class="filter-tab p-3 md:p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center hover:bg-emerald-100 transition">
                <span class="block text-[10px] md:text-xs font-bold text-slate-500 uppercase">1st Division</span>
                <span id="count1st" class="text-xl md:text-2xl font-black text-emerald-600">0</span>
            </button>
            <button onclick="filterResults('2ND DIVISION')" id="tab-2ND" class="filter-tab p-3 md:p-4 bg-amber-50 border border-amber-100 rounded-xl text-center hover:bg-amber-100 transition">
                <span class="block text-[10px] md:text-xs font-bold text-slate-500 uppercase">2nd Division</span>
                <span id="count2nd" class="text-xl md:text-2xl font-black text-amber-600">0</span>
            </button>
            <button onclick="filterResults('3RD DIVISION')" id="tab-3RD" class="filter-tab p-3 md:p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center hover:bg-indigo-100 transition">
                <span class="block text-[10px] md:text-xs font-bold text-slate-500 uppercase">3rd Division</span>
                <span id="count3rd" class="text-xl md:text-2xl font-black text-indigo-600">0</span>
            </button>
            <button onclick="filterResults('FAIL')" id="tab-FAIL" class="filter-tab p-3 md:p-4 bg-rose-50 border border-rose-100 rounded-xl text-center hover:bg-rose-100 transition">
                <span class="block text-[10px] md:text-xs font-bold text-slate-500 uppercase">Failed Students</span>
                <span id="countFail" class="text-xl md:text-2xl font-black text-rose-600">0</span>
            </button>
        </div>

        <div id="resultsTableContainer" class="hidden p-4 md:p-6">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 no-print">
                <h3 class="text-md md:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <i class="fa-solid fa-list-check text-blue-600"></i> Student Wise Performance Register
                </h3>
                
                <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div class="flex items-center gap-1.5 border border-slate-300 rounded-lg px-2 py-1.5 bg-white">
                        <i class="fa-solid fa-arrow-down-short-wide text-slate-500 text-xs"></i>
                        <select id="sortSelector" onchange="applySortingAndRender()" class="outline-none bg-transparent font-bold text-xs text-slate-700 cursor-pointer">
                            <option value="DEFAULT">Default (Roll No Wise)</option>
                            <option value="MAX">Sort by Max Marks</option>
                            <option value="MIN">Sort by Min Marks</option>
                        </select>
                    </div>
                    
                    <button onclick="printList()" class="bg-slate-800 hover:bg-slate-950 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition shadow-sm">
                        <i class="fa-solid fa-print"></i> Print Entire List
                    </button>
                </div>
            </div>

            <div class="overflow-x-auto border border-slate-200 rounded-xl">
                <table class="w-full text-xs md:text-sm text-left whitespace-nowrap">
                    <thead class="font-bold text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th class="px-4 py-3">Roll No</th>
                            <th class="px-4 py-3">Student Name</th>
                            <th class="px-4 py-3">Father's Name</th>
                            <th class="px-4 py-3">School Name</th>
                            <th class="px-4 py-3 text-center">Marks</th>
                            <th class="px-4 py-3 text-center">Division</th>
                            <th class="px-4 py-3 text-center no-print">Action</th>
                        </tr>
                    </thead>
                    <tbody id="bulkTableBody" class="divide-y divide-slate-100">
                        </tbody>
                </table>
            </div>
        </div>
    </div>


    <div id="marksheetModal" class="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 md:p-4 hidden">
        <div class="bg-white w-full max-w-3xl rounded-xl  overflow-hidden max-h-[95vh] flex flex-col">
            
            <div class="p-4 bg-slate-800 text-white flex justify-between items-center no-print">
                <span class="font-bold tracking-wide text-xs md:text-sm uppercase"><i class="fa-solid fa-id-card-clip mr-2 text-blue-400"></i>Official Marksheet Card View</span>
                <button onclick="closeModal()" class="text-slate-400 hover:text-white text-xl p-1"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div id="printableMarksheetArea" class="p-4 md:p-6 overflow-y-auto flex-1 bg-white">
                <div class="text-center border-b-2 border-slate-800 pb-3 mb-4">
                    <h2 class="text-lg md:text-xl font-black text-slate-900 tracking-tight">BIHAR SCHOOL EXAMINATION BOARD, PATNA</h2>
                    <p class="text-[10px] md:text-xs font-bold text-slate-600 mt-0.5 uppercase tracking-wider">Statement of Marks - Annual Secondary Examination, 2026</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs border border-slate-200 p-3 bg-slate-50/50 rounded-lg mb-4 uppercase">
                    <div><span class="text-slate-400 font-medium">Roll Code - No:</span> <strong id="mRoll" class="text-slate-800 pl-1">-</strong></div>
                    <div><span class="text-slate-400 font-medium">Registration No:</span> <strong id="mReg" class="text-slate-800 pl-1">-</strong></div>
                    <div><span class="text-slate-400 font-medium">Student Name:</span> <strong id="mName" class="text-slate-800 pl-1">-</strong></div>
                    <div><span class="text-slate-400 font-medium">BSEB ID:</span> <strong id="mBsebId" class="text-slate-800 pl-1">-</strong></div>
                    <div><span class="text-slate-400 font-medium">Father's Name:</span> <strong id="mFather" class="text-slate-800 pl-1">-</strong></div>
                    <div><span class="text-slate-400 font-medium">Exam Type:</span> <strong id="mType" class="text-slate-800 pl-1">-</strong></div>
                    <div class="sm:col-span-2"><span class="text-slate-400 font-medium">School Name:</span> <strong id="mSchool" class="text-slate-800 pl-1">-</strong></div>
                </div>

                <div class="border border-slate-200 rounded-lg overflow-hidden mb-4 text-xs">
                    <table class="w-full text-left">
                        <thead class="bg-slate-100 text-slate-700 border-b font-bold uppercase">
                            <tr>
                                <th class="p-2.5">Subject Name</th>
                                <th class="p-2.5 text-center">Theory</th>
                                <th class="p-2.5 text-center">Int / Project</th>
                                <th class="p-2.5 text-center">Practical</th>
                                <th class="p-2.5 text-center">Total Marks</th>
                                <th class="p-2.5 text-center">Result</th>
                            </tr>
                        </thead>
                        <tbody id="mSubjectsBody" class="divide-y text-slate-700">
                            </tbody>
                    </table>
                </div>

                <div class="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-lg">
                    <div><span class="text-[10px] uppercase font-bold text-slate-500">Grand Total Mark</span> <p id="mGrandTotal" class="text-md md:text-lg font-black text-blue-700 mt-0.5">-</p></div>
                    <div class="text-right"><span class="text-[10px] uppercase font-bold text-slate-500">Final Result Status</span> <p id="mDivision" class="text-xs md:text-sm font-extrabold text-slate-800 mt-0.5 uppercase tracking-wide">-</p></div>
                </div>
            </div>

            <div class="p-4 bg-slate-50 border-t flex justify-end gap-3 no-print">
                <button onclick="closeModal()" class="px-4 py-2 border rounded-lg text-sm text-slate-600 font-medium hover:bg-slate-100 transition">Cancel</button>
                <button onclick="printMarksheet()" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg flex items-center gap-2 transition shadow-sm">
                    <i class="fa-solid fa-print"></i> Print Marksheet
                </button>
            </div>
        </div>
    </div>


    <script>
        let allStudentsData = []; 
        let highestMarksValue = 0; 
        let currentFilterType = 'ALL';

        async function fetchBulkResults() {
            const rollCode = document.getElementById('rollCode').value.trim();
            const startRoll = parseInt(document.getElementById('startRoll').value);
            const endRoll = parseInt(document.getElementById('endRoll').value);

            if(!rollCode || isNaN(startRoll) || isNaN(endRoll)) {
                return alert("Saari fields fill kijiye!");
            }
            if(startRoll > endRoll) {
                return alert("Start Roll Number, End Roll Number se chota hona chahiye!");
            }
            
            const totalRecords = endRoll - startRoll + 1;
            const searchBtn = document.getElementById('searchBtn');
            const progressContainer = document.getElementById('progressContainer');
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            const progressPercent = document.getElementById('progressPercent');
            
            searchBtn.disabled = true;
            searchBtn.className = "w-full bg-slate-400 text-white py-2.5 rounded-lg cursor-not-allowed font-bold text-center";
            searchBtn.innerText = "Processing Queue...";
            progressContainer.classList.remove('hidden');
            
            allStudentsData = []; 
            highestMarksValue = 0; 

            let currentProcessed = 0;
            let failureStreak = 0; // Continuous failure track karne ke liye
            let rangeTriggerAlert = false;

            for (let currentRoll = startRoll; currentRoll <= endRoll; currentRoll++) {
                progressText.innerText = "Fetching Roll No: " + currentRoll + "...";
                
                try {
                    const response = await fetch("/get-result?roll_code=" + rollCode + "&roll_no=" + currentRoll);
                    const json = await response.json();
                    
                    if (json.success && json.data) {
                        const sData = json.data;
                        allStudentsData.push(sData);
                        failureStreak = 0; // Data milte hi reset

                        const numMarks = parseInt(sData.total);
                        if (!isNaN(numMarks) && sData.division && !sData.division.toUpperCase().includes("FAIL")) {
                            if (numMarks > highestMarksValue) {
                                highestMarksValue = numMarks;
                            }
                        }
                    } else {
                        failureStreak++;
                        // Agar lagatar 5 roll numbers ka response valid nahi aata hai to loop break kar do
                        if(failureStreak >= 5) {
                            rangeTriggerAlert = true;
                            break;
                        }
                    }
                } catch (err) {
                    console.error("Fetch skipped for:", currentRoll);
                    failureStreak++;
                }

                currentProcessed++;
                const percentage = Math.round((currentProcessed / totalRecords) * 100);
                progressBar.style.width = percentage + '%';
                progressPercent.innerText = percentage + '%';
            }

            searchBtn.disabled = false;
            searchBtn.className = "w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-bold tracking-wide transition flex items-center justify-center gap-2 shadow-sm";
            searchBtn.innerText = "Fetch Class Data";
            progressContainer.classList.add('hidden');

            document.getElementById('statsPanel').classList.remove('hidden');
            document.getElementById('resultsTableContainer').classList.remove('hidden');

            // Default Selection initialization
            document.getElementById('sortSelector').value = 'DEFAULT';
            
            calculateStats();
            filterResults('ALL');

            // Agar range real database cap se bdi thi to break lagne ke baad clear warning prompt de do
            if(rangeTriggerAlert) {
                alert("Aapka range bahot jyada hai! Mere paas bus " + allStudentsData.length + " students ka hi real data mila.");
            }
        }

        function calculateStats() {
            let t = allStudentsData.length;
            let f1st = allStudentsData.filter(s => s.division && (s.division.toUpperCase().includes('1ST') || s.division.toUpperCase() === 'FIRST')).length;
            let f2nd = allStudentsData.filter(s => s.division && (s.division.toUpperCase().includes('2ND') || s.division.toUpperCase() === 'SECOND')).length;
            let f3rd = allStudentsData.filter(s => s.division && (s.division.toUpperCase().includes('3RD') || s.division.toUpperCase() === 'THIRD')).length;
            let fail = allStudentsData.filter(s => s.division && (s.division.toUpperCase().includes('FAIL'))).length;

            document.getElementById('countTotal').innerText = t;
            document.getElementById('count1st').innerText = f1st;
            document.getElementById('count2nd').innerText = f2nd;
            document.getElementById('count3rd').innerText = f3rd;
            document.getElementById('countFail').innerText = fail;
        }

        function filterResults(filterType) {
            currentFilterType = filterType;
            document.querySelectorAll('.filter-tab').forEach(tab => {
                tab.classList.remove('ring-2', 'ring-blue-500');
            });
            
            let targetTabKey = 'ALL';
            if(filterType.includes('1ST')) targetTabKey = '1ST';
            if(filterType.includes('2ND')) targetTabKey = '2ND';
            if(filterType.includes('3RD')) targetTabKey = '3RD';
            if(filterType.includes('FAIL')) targetTabKey = 'FAIL';
            document.getElementById("tab-" + targetTabKey).classList.add('ring-2', 'ring-blue-500');

            applySortingAndRender();
        }
function printMarksheet() {
    document.body.classList.add("print-marksheet");
    window.print();
    document.body.classList.remove("print-marksheet");
}

function printList() {
    document.body.classList.remove("print-marksheet");
    window.print();
}
        // NEW UI CONTROLLER: Dropdown choice & filtering metrics evaluation logic 
        function applySortingAndRender() {
            const sortMode = document.getElementById('sortSelector').value;
            const tbody = document.getElementById('bulkTableBody');
            tbody.innerHTML = '';

            let processedList = [...allStudentsData];

            // 1. Apply active filter tab logic
            if (currentFilterType !== 'ALL') {
                processedList = processedList.filter(s => s.division && s.division.toUpperCase().includes(currentFilterType));
            }

            // 2. Perform target array sorting dynamically 
            if(sortMode === 'DEFAULT') {
                // Ascending order based on real roll numbers sequence
                processedList.sort((a, b) => (parseInt(a.roll_no) || 0) - (parseInt(b.roll_no) || 0));
            } else if(sortMode === 'MAX') {
                // Toppers priority sequence
                processedList.sort((a, b) => (parseInt(b.total) || 0) - (parseInt(a.total) || 0));
            } else if(sortMode === 'MIN') {
                // Reverse sorting priority matrix
                processedList.sort((a, b) => {
                    const markA = a.total === '-' ? 999 : (parseInt(a.total) || 0);
                    const markB = b.total === '-' ? 999 : (parseInt(b.total) || 0);
                    return markA - markB;
                });
            }

            if(processedList.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center font-medium text-slate-400">No records found matching criteria.</td></tr>';
                return;
            }

            // Render elements 
            processedList.forEach(s => {
                let divColor = 'text-slate-600 bg-slate-100';
                const divStr = s.division ? s.division.toUpperCase() : '';

                if (divStr.includes('1ST') || divStr === 'FIRST') divColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                else if (divStr.includes('2ND') || divStr === 'SECOND') divColor = 'text-amber-700 bg-amber-50 border-amber-200';
                else if (divStr.includes('3RD') || divStr === 'THIRD') divColor = 'text-indigo-700 bg-indigo-50 border-indigo-200';
                else if (divStr.includes('FAIL')) divColor = 'text-rose-700 bg-rose-50 border-rose-200';

                let topperBadgeString = '';
                if(highestMarksValue > 0 && parseInt(s.total) === highestMarksValue) {
                    topperBadgeString = ' <span class="ml-1 bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 font-black"><i class="fa-solid fa-crown text-[9px]"></i> TOPPER</span>';
                }

                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-50 transition border-b border-slate-100";
                
                tr.innerHTML = '<td class="px-4 py-3.5 font-mono font-bold text-slate-700">' + s.roll_no + '</td>' +
                               '<td class="px-4 py-3.5 font-semibold text-slate-900 flex items-center">' + s.name + topperBadgeString + '</td>' +
                               '<td class="px-4 py-3.5 text-slate-500">' + s.father_name + '</td>' +
                               '<td class="px-4 py-3.5 text-slate-500 max-w-xs truncate" title="' + s.school_name + '">' + s.school_name + '</td>' +
                               '<td class="px-4 py-3.5 text-center font-bold text-slate-700">' + s.total + '</td>' +
                               '<td class="px-4 py-3.5 text-center">' +
                               '<span class="px-2.5 py-1 border text-xs font-bold rounded-full ' + divColor + '">' + s.division + '</span>' +
                               '</td>' +
                               '<td class="px-4 py-3.5 text-center no-print">' +
                               '<button onclick="openMarksheet(' + s.roll_no + ')" class="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 mx-auto">' +
                               '<i class="fa-solid fa-eye"></i> View</button>' +
                               '</td>';
                               
                tbody.appendChild(tr);
            });
        }

        function openMarksheet(rollNo) {
            const student = allStudentsData.find(s => parseInt(s.roll_no) === parseInt(rollNo));
            if(!student || (student.name && student.name.includes("NOT FOUND"))) {
                return alert("Is student ka deeper detail available nahi hai!");
            }

            document.getElementById('mRoll').innerText = (student.roll_code || '') + " - " + student.roll_no;
            document.getElementById('mReg').innerText = student.reg_no || '-';
            document.getElementById('mName').innerText = student.name || '-';
            document.getElementById('mBsebId').innerText = student.bseb_id || '-';
            document.getElementById('mFather').innerText = student.father_name || '-';
            document.getElementById('mType').innerText = student.exam_type || 'REGULAR';
            document.getElementById('mSchool').innerText = student.school_name || '-';
            document.getElementById('mGrandTotal').innerText = student.total || '0';
            document.getElementById('mDivision').innerText = student.division || '-';

            const subBody = document.getElementById('mSubjectsBody');
            subBody.innerHTML = '';

            if(student.subjects && student.subjects.length > 0) {
                student.subjects.forEach(sub => {
                    const isFail = sub.sub_result === "F";
                    const rowText = isFail ? "class='text-rose-600 bg-rose-50/50 font-medium'" : "";
                    
                    subBody.innerHTML += '<tr ' + rowText + '>' +
                        '<td class="p-2.5"><strong>' + sub.sub_code + '</strong> - ' + sub.sub_name + '</td>' +
                        '<td class="p-2.5 text-center">' + (sub.theory || '-') + '</td>' +
                        '<td class="p-2.5 text-center">' + (sub.project_work || sub.literacy_activity || '-') + '</td>' +
                        '<td class="p-2.5 text-center">' + (sub.practical || sub.ia_sci || '-') + '</td>' +
                        '<td class="p-2.5 text-center font-bold">' + sub.sub_total + '</td>' +
                        '<td class="p-2.5 text-center font-bold ' + (isFail ? 'text-rose-600' : 'text-emerald-600') + '">' + (sub.sub_result || 'P') + '</td>' +
                    '</tr>';
                });
            } else {
                subBody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400">Subject data loading error.</td></tr>';
            }

            document.getElementById('marksheetModal').classList.remove('hidden');
        }

        function closeModal() {
            document.getElementById('marksheetModal').classList.add('hidden');
        }
    </script>
</body>
</html>
    `);
});

app.listen(PORT, () => console.log(`Server live at http://localhost:${PORT}`));