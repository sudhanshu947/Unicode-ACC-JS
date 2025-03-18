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

    // Security: Generate a random client ID on page load
    const clientId = Math.random().toString(36).substring(2, 15);

    // Function to generate request signature
    function generateSignature(data) {
        // This is a simplified version - in production, use a more secure method
        const timestamp = Date.now();
        const stringToSign = JSON.stringify(data) + timestamp + clientId;
        return btoa(stringToSign);
    }

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

        setLoading(generateBtn, true);

        try {
            const signature = generateSignature({ hwid });
            const response = await fetch('/api/generateKey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-ID': clientId
                },
                body: JSON.stringify({ hwid, signature })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate key');
            }

            const data = await response.json();
            
            licenseKeyInput.value = data.activationKey;
            resultContainer.classList.remove('hidden');
            copyBtn.disabled = false;
            validateInput.value = data.activationKey;
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
            
            // Fallback for browsers that don't support clipboard API
            if (!navigator.clipboard) {
                licenseKeyInput.select();
                document.execCommand('copy');
            } else {
                await navigator.clipboard.writeText(licenseKeyInput.value);
            }
            
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
            const signature = generateSignature({ hwid, keyToValidate });
            const response = await fetch('/api/validateKey', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Client-ID': clientId
                },
                body: JSON.stringify({ hwid, keyToValidate, signature })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to validate key');
            }

            const data = await response.json();
            
            if (data.isValid) {
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
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });

    validateInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
    });
});