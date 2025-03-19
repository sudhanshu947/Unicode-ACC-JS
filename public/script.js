document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const hwidInput = document.getElementById('hwid');
    const activationCodeInput = document.getElementById('activationCode');
    const generateBtn = document.getElementById('generateBtn');
    const resultContainer = document.getElementById('resultContainer');
    const validationResult = document.getElementById('validationResult');
    const aboutLink = document.getElementById('aboutLink');
    const aboutModal = document.getElementById('aboutModal');
    const closeModalBtns = document.querySelectorAll('.close');

    // Generate key when the button is clicked
    generateBtn.addEventListener('click', () => {
        const hwid = hwidInput.value.trim();
        if (!hwid) {
            showMessage('Please enter a valid Hardware ID.', 'error');
            return;
        }

        const activationCode = calculateActId(hwid);
        activationCodeInput.value = activationCode;
        
        showMessage('License key generated successfully.', 'success');
    });

    // About link functionality
    aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.style.display = 'block';
    });

    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            aboutModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
    });

    // Function to calculate activation ID based on HWID
    function calculateActId(sysId) {
        if (!sysId.trim()) {
            return 0;
        }
        
        // Trim whitespace
        sysId = sysId.trim();
        const t = sysId.length;
        let tot = 0;

        // Loop over each character in the sysId
        for (let z = 0; z < t; z++) {
            // Convert the character to a digit (or 0 if not a digit)
            const digit = parseInt(sysId[z]) || 0;
            tot += digit + 79;
        }

        // Extract substring (last 5 characters)
        const substringStart = Math.max(0, t - 5);
        const substringPart = sysId.substring(substringStart);
        const valueFromSubstring = parseInt(substringPart) || 0;
        tot += valueFromSubstring;

        // Calculate ACT_ID using the formula:
        // ACT_ID = int(sqrt(tot) * (Year(current date) + 1)) + Day(current date)
        const sqrtTot = Math.sqrt(tot);
        const yearFactor = new Date().getFullYear() + 1;
        const actId = Math.floor(sqrtTot * yearFactor) + new Date().getDate();

        return actId;
    }

    // Function to show message
    function showMessage(message, type) {
        validationResult.textContent = message;
        validationResult.className = 'message ' + type;
        resultContainer.style.display = 'block';
    }
});