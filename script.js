document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const hwidInput = document.getElementById('hwid');
    const generateBtn = document.getElementById('generateBtn');
    const activationCodeInput = document.getElementById('activationCode');
    const copyBtn = document.getElementById('copyBtn');

    // Add event listeners
    generateBtn.addEventListener('click', generateActivationCode);
    copyBtn.addEventListener('click', copyActivationCode);

    // Function to calculate activation ID based on the C# logic
    function calculateActId(sysId) {
        if (!sysId || sysId.trim() === '') {
            return 0;
        }

        // Trim whitespace
        sysId = sysId.trim();
        const t = sysId.length;
        let tot = 0;

        // Loop over each character in the sysId
        for (let z = 0; z < t; z++) {
            // Convert the character to a digit
            const digit = parseInt(sysId[z]) || 0;
            tot += digit + 79;
        }

        // Determine the starting index for the substring
        let substringStart = t - 5;
        if (substringStart < 0) {
            substringStart = 0;
        }
        const substringPart = sysId.substring(substringStart);

        // Convert the substring to a numeric value
        const valueFromSubstring = parseInt(substringPart) || 0;
        tot += valueFromSubstring;

        // Calculate ACT_ID using the formula:
        // ACT_ID = int(sqrt(tot) * (current year + 1)) + current day
        const currentDate = new Date();
        const sqrtTot = Math.sqrt(tot);
        const yearFactor = currentDate.getFullYear() + 1;
        const actId = Math.floor(sqrtTot * yearFactor) + currentDate.getDate();

        return actId;
    }

    // Function to generate activation code
    function generateActivationCode() {
        const hwid = hwidInput.value;
        
        if (!hwid || hwid.trim() === '') {
            showError('Please enter a valid Hardware ID');
            return;
        }

        const activationCode = calculateActId(hwid);
        activationCodeInput.value = activationCode;
    }

    // Function to copy activation code to clipboard
    function copyActivationCode() {
        if (!activationCodeInput.value) {
            showError('No activation code to copy');
            return;
        }

        activationCodeInput.select();
        document.execCommand('copy');
        
        // Show success message
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }

    // Function to show error message
    function showError(message) {
        alert(message);
    }
});