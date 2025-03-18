document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const hwidInput = document.getElementById('hwid');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const licenseKeyInput = document.getElementById('licenseKey');
    const resultContainer = document.getElementById('resultContainer');
    const validateInput = document.getElementById('validateInput');
    const validateBtn = document.getElementById('validateBtn');
    const validationResult = document.getElementById('validationResult');
    const aboutLink = document.getElementById('aboutLink');
    const aboutModal = document.getElementById('aboutModal');
    const closeModal = document.querySelector('.close');

    // Add loading state to buttons
    function setLoading(button, isLoading) {
        const icon = button.querySelector('i');
        const text = button.querySelector('span');
        
        if (isLoading) {
            icon.className = 'fas fa-spinner fa-spin';
            text.textContent = 'Processing...';
            button.disabled = true;
        } else {
            icon.className = button.dataset.originalIcon;
            text.textContent = button.dataset.originalText;
            button.disabled = false;
        }
    }

    // Store original button states
    generateBtn.dataset.originalIcon = generateBtn.querySelector('i').className;
    generateBtn.dataset.originalText = generateBtn.querySelector('span').textContent;
    copyBtn.dataset.originalIcon = copyBtn.querySelector('i').className;
    copyBtn.dataset.originalText = copyBtn.querySelector('span').textContent;
    validateBtn.dataset.originalIcon = validateBtn.querySelector('i').className;
    validateBtn.dataset.originalText = validateBtn.querySelector('span').textContent;

    // Generate key when the button is clicked
    generateBtn.addEventListener('click', async () => {
        const hwid = hwidInput.value.trim();
        if (!hwid) {
            showError('Please enter a valid Hardware ID.');
            return;
        }

        // Show loading state
        setLoading(generateBtn, true);

        try {
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const activationKey = calculateActId(hwid);
            licenseKeyInput.value = activationKey;
            resultContainer.classList.remove('hidden');
            copyBtn.disabled = false;
            
            // Auto-fill validation input
            validateInput.value = activationKey;

            // Show success message
            showSuccess('Key generated successfully!');
        } catch (error) {
            showError('An error occurred while generating the key.');
            console.error('Key generation error:', error);
        } finally {
            setLoading(generateBtn, false);
        }
    });

    // Copy key to clipboard
    copyBtn.addEventListener('click', async () => {
        try {
            setLoading(copyBtn, true);
            await navigator.clipboard.writeText(licenseKeyInput.value);
            
            // Show success feedback
            const originalText = copyBtn.querySelector('span').textContent;
            copyBtn.querySelector('i').className = 'fas fa-check';
            copyBtn.querySelector('span').textContent = 'Copied!';
            
            setTimeout(() => {
                copyBtn.querySelector('i').className = copyBtn.dataset.originalIcon;
                copyBtn.querySelector('span').textContent = originalText;
            }, 2000);
        } catch (error) {
            showError('Failed to copy key to clipboard.');
            console.error('Copy error:', error);
        } finally {
            setLoading(copyBtn, false);
        }
    });

    // Validate key
    validateBtn.addEventListener('click', async () => {
        const hwid = hwidInput.value.trim();
        const keyToValidate = validateInput.value.trim();
        
        if (!hwid) {
            showError('Please enter a Hardware ID first.');
            return;
        }
        
        if (!keyToValidate) {
            showError('Please enter a key to validate.');
            return;
        }

        setLoading(validateBtn, true);

        try {
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const calculatedKey = calculateActId(hwid);
            const isValid = parseInt(keyToValidate) === calculatedKey;
            
            if (isValid) {
                showSuccess('Valid activation key!');
                validateBtn.querySelector('i').className = 'fas fa-check-circle';
            } else {
                showError('Invalid activation key!');
                validateBtn.querySelector('i').className = 'fas fa-times-circle';
            }
        } catch (error) {
            showError('An error occurred while validating the key.');
            console.error('Validation error:', error);
        } finally {
            setLoading(validateBtn, false);
        }
    });

    // Modal functionality
    aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });

    closeModal.addEventListener('click', () => {
        aboutModal.style.display = 'none';
        document.body.style.overflow = '';
    });

    window.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    });

    // Function to calculate activation ID based on HWID
    function calculateActId(sysId) {
        sysId = sysId.trim();
        const t = sysId.length;
        let tot = 0;

        // Loop over each character in the sysId
        for (let z = 0; z < t; z++) {
            // Convert the character to a digit (or 0 if not a digit)
            const digit = parseInt(sysId[z]) || 0;
            tot += digit + 79;
        }

        // Extract last 5 characters as a number
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

    // Function to show error message
    function showError(message) {
        validationResult.textContent = message;
        validationResult.className = 'message error';
        validationResult.style.display = 'block';
    }

    // Function to show success message
    function showSuccess(message) {
        validationResult.textContent = message;
        validationResult.className = 'message success';
        validationResult.style.display = 'block';
    }

    // Add input validation
    hwidInput.addEventListener('input', (e) => {
        // Remove any non-numeric characters
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    validateInput.addEventListener('input', (e) => {
        // Remove any non-numeric characters
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
});