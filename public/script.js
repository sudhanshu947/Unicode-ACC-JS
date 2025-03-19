 // Simple License Key Generator
document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // Get DOM elements
    const hwidInput = document.getElementById('hwid');
    const activationCodeInput = document.getElementById('activationCode');
    const generateBtn = document.getElementById('generateBtn');
    const resultContainer = document.getElementById('resultContainer');
    const validationResult = document.getElementById('validationResult');
    const aboutLink = document.getElementById('aboutLink');
    const aboutModal = document.getElementById('aboutModal');
    const closeModalBtns = document.querySelectorAll('.close');

    // Calculate activation ID
    function calculateActId(sysId) {
        if (!sysId || !sysId.trim()) return 0;
        
        try {
            sysId = sysId.trim();
            const length = sysId.length;
            let total = 0;

            // Calculate total based on system ID
            for (let i = 0; i < length; i++) {
                const digit = parseInt(sysId[i]) || 0;
                total += digit + 79;
            }

            // Add value from last 5 characters
            const substringStart = Math.max(0, length - 5);
            const substringPart = sysId.substring(substringStart);
            const valueFromSubstring = parseInt(substringPart) || 0;
            total += valueFromSubstring;

            // Generate activation ID
            const yearFactor = new Date().getFullYear() + 1;
            return Math.floor(Math.sqrt(total) * yearFactor) + new Date().getDate();
        } catch (e) {
            return 0;
        }
    }

    // Show message with timeout
    function showMessage(message, type) {
        validationResult.textContent = message;
        validationResult.className = 'message ' + type;
        resultContainer.style.display = 'block';
        
        setTimeout(() => {
            validationResult.textContent = '';
            resultContainer.style.display = 'none';
        }, 5000);
    }

    // Generate button click handler
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

    // About modal functionality
    aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        aboutModal.style.display = 'block';
    });

    // Close modal functionality
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            aboutModal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            aboutModal.style.display = 'none';
        }
    });

    // Security measures
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if ((e.ctrlKey && e.shiftKey && e.key === 'I') || 
            (e.ctrlKey && e.shiftKey && e.key === 'J') || 
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
        }
    });

    // Prevent copy/paste on activation code
    activationCodeInput.addEventListener('copy', e => e.preventDefault());
    activationCodeInput.addEventListener('cut', e => e.preventDefault());
});