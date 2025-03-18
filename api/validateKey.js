const crypto = require('crypto');

// Secret key for HMAC (should be the same as in generateKey.js)
const SECRET_KEY = process.env.SECRET_KEY || crypto.randomBytes(32).toString('hex');

// Function to calculate activation ID (same as in generateKey.js)
function calculateActId(sysId) {
    sysId = sysId.trim();
    const t = sysId.length;
    let tot = 0;

    for (let z = 0; z < t; z++) {
        const digit = parseInt(sysId[z]) || 0;
        tot += digit + 79;
    }

    const substringStart = Math.max(0, t - 5);
    const substringPart = sysId.substring(substringStart);
    const valueFromSubstring = parseInt(substringPart) || 0;
    tot += valueFromSubstring;

    const sqrtTot = Math.sqrt(tot);
    const yearFactor = new Date().getFullYear() + 1;
    const actId = Math.floor(sqrtTot * yearFactor) + new Date().getDate();

    return actId;
}

// Function to generate HMAC signature
function generateSignature(data) {
    return crypto
        .createHmac('sha256', SECRET_KEY)
        .update(JSON.stringify(data))
        .digest('hex');
}

// Function to validate request signature
function validateSignature(data, signature) {
    const expectedSignature = generateSignature(data);
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { hwid, keyToValidate, signature } = req.body;

        if (!hwid || !keyToValidate || !signature) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate request signature
        if (!validateSignature({ hwid, keyToValidate }, signature)) {
            return res.status(401).json({ error: 'Invalid request signature' });
        }

        // Calculate expected key
        const calculatedKey = calculateActId(hwid);
        const isValid = parseInt(keyToValidate) === calculatedKey;

        // Generate response signature
        const responseSignature = generateSignature({ isValid });

        return res.status(200).json({
            isValid,
            signature: responseSignature
        });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}