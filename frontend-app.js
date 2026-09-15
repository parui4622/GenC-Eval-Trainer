// ==========================================
// 1. CONFIGURATION
// ==========================================
// Pointing to your local Node.js proxy server to bypass corporate VPN restrictions
const API_URL = "/api/generate";

let recognition;
let isRecording = false;
let finalTranscript = '';

// ==========================================
// 2. SYSTEM DIAGNOSTICS & SETUP
// ==========================================
window.onload = function runDiagnostics() {
    let errors = [];
    const panel = document.getElementById('diagnostic-panel');
    
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!window.SpeechRecognition) {
        errors.push("Critical: Web Speech API is not supported in this browser. Use Chrome or Edge.");
    } else {
        recognition = new window.SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript + ' ';
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            document.getElementById('transcript').innerHTML = finalTranscript + '<i class="text-gray-400">' + interimTranscript + '</i>';
        };
    }

    try {
        sessionStorage.setItem('test', '1');
        sessionStorage.removeItem('test');
    } catch(e) {
        errors.push("Warning: SessionStorage is blocked. Leaderboard will not save.");
    }

    if (errors.length > 0) {
        panel.innerHTML = `<div class="bg-red-100 text-red-700 p-4 rounded border border-red-400"><b>System Errors Detected:</b><ul class="list-disc ml-5 mt-2"><li>${errors.join('</li><li>')}</li></ul></div>`;
    } else {
        panel.innerHTML = `<div class="bg-green-100 text-green-700 p-3 rounded border border-green-400"><b>System Diagnostics:</b> All modules operational.</div>`;
        setTimeout(() => panel.style.display = 'none', 4000); 
    }
};

// ==========================================
// 3. UI EVENT LISTENERS
// ==========================================
document.getElementById('modeSelect').addEventListener('change', function() {
    const diffSelect = document.getElementById('difficultySelect');
    diffSelect.style.display = this.value === 'interview' ? 'block' : 'none';
});

// ==========================================
// 4. API: FETCH QUESTION (Via Local Proxy)
// ==========================================
async function fetchQuestion() {
    const mode = document.getElementById('modeSelect').value;
    const diff = document.getElementById('difficultySelect').value;
    const seed = Date.now(); 
    let prompt = "";

    if (mode === 'interview') {
        prompt = `Generate a single, unique ${diff}-level interview question for a software developer. Use simple, direct vocabulary. Maximum 20 words. Do not repeat standard questions. Seed: ${seed}`;
    } else if (mode === 'topic') {
        prompt = `Generate a single, common extempore topic for a 1-minute speech. Just output the topic phrase. Seed: ${seed}`;
    } else {
        prompt = `Generate a single, highly common English noun or concept word. Just output the word. Seed: ${seed}`;
    }

    const display = document.getElementById('questionDisplay');
    display.innerText = "Loading prompt...";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error("Server returned non-JSON response:", textResponse);
            throw new Error("Server returned HTML instead of JSON. Are you on the correct port? Ensure you are accessing http://localhost:3000 (do not use Live Server on port 5500).");
        }
        
        const data = await response.json();
        
        if (data.error) {
            console.error("API Error Object:", data.error);
            const errCode = data.error.code ? `API Error ${data.error.code}:` : "API Error:";
            const errMsg = data.error.message || (typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
            display.innerHTML = `<span class="text-red-600 font-bold">${errCode}</span> ${errMsg}`;
            return;
        }

        if (data.candidates && data.candidates.length > 0) {
            display.innerText = data.candidates[0].content.parts[0].text.replace(/\*/g, '').trim();
        } else {
            display.innerText = "Error: Received an empty response from the AI.";
        }
        
    } catch (error) {
        display.innerHTML = `<span class="text-red-600 font-bold">Network/Routing Error:</span> ${error.message || 'Check the console for details. Ensure your Node.js server is running.'}`;
        console.error("Fetch Exception:", error);
    }
}

// ==========================================
// 5. AUDIO RECORDING CONTROLS
// ==========================================
function startRecording() {
    if (!recognition) return alert("Speech API not available.");
    finalTranscript = '';
    document.getElementById('transcript').innerHTML = '';
    document.getElementById('resultsPanel').classList.add('hidden');
    
    recognition.start();
    isRecording = true;
    
    document.getElementById('startBtn').classList.add('hidden');
    const stopBtn = document.getElementById('stopBtn');
    stopBtn.classList.remove('hidden');
    stopBtn.classList.add('recording-pulse');
}

function stopRecording() {
    if (isRecording) {
        recognition.stop();
        isRecording = false;
        
        document.getElementById('stopBtn').classList.add('hidden');
        document.getElementById('stopBtn').classList.remove('recording-pulse');
        document.getElementById('startBtn').classList.remove('hidden');
        
        evaluateResponse();
    }
}

// ==========================================
// 6. API: EVALUATE RESPONSE (Via Local Proxy)
// ==========================================
async function evaluateResponse() {
    if (finalTranscript.trim().split(' ').length < 5) {
        alert("Please speak a longer response to be evaluated.");
        return;
    }

    document.getElementById('resultsPanel').classList.remove('hidden');
    document.getElementById('aiFeedback').innerText = "Analyzing structure and pacing...";
    const ragEl = document.getElementById('ragStatus');
    ragEl.innerText = "PROCESSING...";
    ragEl.className = "text-xl font-bold p-3 rounded mb-4 text-center bg-gray-200 text-gray-800";
    document.getElementById('scoreDisplay').innerText = "";

    const question = document.getElementById('questionDisplay').innerText;
    
    const evaluationPrompt = `
    You are a strict corporate communication evaluator.
    Prompt: "${question}"
    User Answer: "${finalTranscript}"

    Evaluate based on these STRICT RULES:
    1. COMPLETENESS: If the answer trails off or is a fragment, it MUST be RED or AMBER.
    2. SVO LOGIC: Look for run-on sentences using too many conjunctions.
    
    Return a JSON object exactly like this:
    {
        "status": "GREEN" (or "AMBER" or "RED"),
        "score": (0 to 100),
        "feedback": "Your brief analytical feedback here."
    }
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contents: [{ parts: [{ text: evaluationPrompt }] }] })
        });

        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error("Server returned non-JSON response:", textResponse);
            throw new Error("Server returned HTML instead of JSON. Ensure you are accessing http://localhost:3000 and not VS Code Live Server.");
        }

        const data = await response.json();
        
        if (data.error) {
            document.getElementById('aiFeedback').innerText = `API Error: ${data.error.message || JSON.stringify(data.error)}`;
            return;
        }

        const rawText = data.candidates[0].content.parts[0].text;
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        const result = JSON.parse(jsonMatch[0]);

        ragEl.innerText = `STATUS: ${result.status}`;
        if (result.status === 'GREEN') ragEl.className = "text-xl font-bold p-3 rounded mb-4 text-center bg-green-100 text-green-800 border border-green-500";
        else if (result.status === 'AMBER') ragEl.className = "text-xl font-bold p-3 rounded mb-4 text-center bg-yellow-100 text-yellow-800 border border-yellow-500";
        else ragEl.className = "text-xl font-bold p-3 rounded mb-4 text-center bg-red-100 text-red-800 border border-red-500";

        document.getElementById('scoreDisplay').innerText = `Score: ${result.score}/100`;
        document.getElementById('aiFeedback').innerText = result.feedback;

        saveToLeaderboard(result.score);

    } catch (error) {
        document.getElementById('aiFeedback').innerText = error.message || "Evaluation failed to parse. Try again.";
        console.error("Evaluation Exception:", error);
    }
}

// ==========================================
// 7. LEADERBOARD (Session Storage)
// ==========================================
function saveToLeaderboard(score) {
    const nameInput = document.getElementById('userName').value.trim();
    const name = nameInput === "" ? "Anonymous Candidate" : nameInput;
    
    let board = JSON.parse(sessionStorage.getItem('interviewScores')) || [];
    board.push({ name: name, score: parseInt(score) });
    board.sort((a, b) => b.score - a.score);
    board = board.slice(0, 5); 
    
    sessionStorage.setItem('interviewScores', JSON.stringify(board));
}

function showLeaderboard() {
    const board = JSON.parse(sessionStorage.getItem('interviewScores')) || [];
    const listEl = document.getElementById('leaderboardList');
    listEl.innerHTML = '';
    
    if (board.length === 0) {
        listEl.innerHTML = '<li class="text-gray-500">No scores recorded in this session yet.</li>';
    } else {
        board.forEach((entry, index) => {
            listEl.innerHTML += `<li class="flex justify-between border-b py-2"><span>${index + 1}. ${entry.name}</span> <span class="font-bold">${entry.score}/100</span></li>`;
        });
    }
    document.getElementById('leaderboardModal').classList.remove('hidden');
}

function closeLeaderboard() {
    document.getElementById('leaderboardModal').classList.add('hidden');
}
