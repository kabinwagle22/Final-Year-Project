let userData = [];
const modeCheckbox = document.getElementById('mode-checkbox');
const chatWindow = document.getElementById('chat-window');

const doctorQuestions = [
    { label: "Age", min: 1, max: 120 },
    { label: "Sex (1=M, 0=F)", min: 0, max: 1 },
    { label: "Chest Pain (0-3)", min: 0, max: 3 },
    { label: "Resting BP", min: 50, max: 250 },
    { label: "Cholesterol", min: 100, max: 600 },
    { label: "Fasting Sugar (1/0)", min: 0, max: 1 },
    { label: "ECG (0-2)", min: 0, max: 2 },
    { label: "Max Heart Rate", min: 60, max: 220 },
    { label: "Ex Angina (1/0)", min: 0, max: 1 },
    { label: "Oldpeak", min: 0, max: 10 },
    { label: "Slope (0-2)", min: 0, max: 2 },
    { label: "Vessels (0-3)", min: 0, max: 3 },
    { label: "Thal (1-3)", min: 1, max: 3 }
];

const patientQuestions = [
    { label: "Age", min: 1, max: 120 },
    { label: "Sex (1=M, 0=F)", min: 0, max: 1 },
    { label: "Resting BP", min: 50, max: 250 },
    { label: "Cholesterol", min: 100, max: 600 },
    { label: "Max Heart Rate", min: 60, max: 220 }
];

// 1. CLEAR CHAT ON TOGGLE
modeCheckbox.addEventListener('change', () => {
    userData = [];
    chatWindow.innerHTML = ''; // Wipes the screen
    const modeName = modeCheckbox.checked ? "Doctor" : "Patient";
    addMessage(`Switched to ${modeName} Mode. Please enter Age to start.`, 'bot');
});

function addMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerText = text;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// NEW: Function to update the sidebar table
function updateHistorySidebar(mode, bp, risk) {
    const historyBody = document.getElementById('history-body');
    const newRow = document.createElement('tr');
    
    // Set color based on risk severity
    const riskColor = risk > 50 ? '#e74c3c' : '#2ecc71';

    newRow.innerHTML = `
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${mode}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">${bp}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; color: ${riskColor}">${risk}%</td>
    `;
    
    historyBody.prepend(newRow); // Newest result at the top
}

async function sendMessage() {
    const isDoctorMode = modeCheckbox.checked;
    const currentQuestions = isDoctorMode ? doctorQuestions : patientQuestions;
    
    const input = document.getElementById('user-input');
    const val = input.value.trim();
    const numVal = parseFloat(val);

    // 2. ERROR HANDLING / VALIDATION
    if (isNaN(numVal)) {
        addMessage(`"${val}" is not a number. Please enter a valid value.`, 'bot');
        input.value = '';
        return;
    }

    const currentQ = currentQuestions[userData.length];
    if (numVal < currentQ.min || numVal > currentQ.max) {
        addMessage(`⚠️ Invalid value for ${currentQ.label}. Please enter between ${currentQ.min} and ${currentQ.max}.`, 'bot');
        input.value = '';
        return;
    }

    addMessage(val, 'user');
    input.value = '';
    userData.push(numVal);

    if (userData.length < currentQuestions.length) {
        addMessage(`Next: ${currentQuestions[userData.length].label}`, 'bot');
    } else {
        addMessage("🤖 AI Processing...", "bot");
        
        let finalFeatures = isDoctorMode ? userData : [
            userData[0], userData[1], 1, userData[2], userData[3], 
            0, 1, userData[4], 0, 1.0, 1, 0, 2
        ];

        try {
            const response = await fetch('http://127.0.0.1:5001/predict', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({features: finalFeatures})
            });
            
            const result = await response.json();

            // 3. Show the Bot's conversational speech and alerts
            addMessage(result.bot_speech, 'bot');

            if (result.alerts && result.alerts.length > 0) {
                result.alerts.forEach(msg => addMessage(msg, 'bot'));
            }

            // 4. Show the final technical score
            addMessage(`RESULT: ${result.status} (${result.risk_score}%)`, 'bot');
            addMessage(`💡 Recommendation: ${result.recommendation}`, 'bot');

            // 5. UPDATE SIDEBAR HISTORY
            const currentBP = isDoctorMode ? userData[3] : userData[2];
            const modeLabel = isDoctorMode ? "Doctor" : "Patient";
            updateHistorySidebar(modeLabel, currentBP, result.risk_score);
            
        } catch (e) {
            addMessage("Server Error. Is app.py running?", "bot");
        }
        
        userData = []; // Reset data for next session
    }
}

// Allow pressing "Enter" to send message
document.getElementById("user-input").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});