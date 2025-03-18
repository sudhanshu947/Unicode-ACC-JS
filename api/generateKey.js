const crypto = require('crypto');

// Secret key for HMAC
const SECRET_KEY = process.env.SECRET_KEY || crypto.randomBytes(32).toString('hex');

// Function to calculate activation ID (moved from client-side)
function calculateActId(sysId) {
    sysId = sysId.trim();
    const t = sysId.length;
    let tot = 0;

    // Loop over each character in the sysId
    for (let z = 0; z < t; z++) {
        const digit = parseInt(sysId[z]) || 0;
        tot += digit + 79;
    }

    // Extract last 5 characters as a number
    const substringStart = Math.max(0, t - 5);
    const substringPart = sysId.substring(substringStart);
    const valueFromSubstring = parseInt(substringPart) || 0;
    tot += valueFromSubstring;

    // Calculate ACT_ID using the formula
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
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { hwid, signature } = req.body;

        // Validate required fields
        if (!hwid || !signature) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate request signature
        if (!validateSignature({ hwid }, signature)) {
            return res.status(401).json({ error: 'Invalid request signature' });
        }

        // Generate activation key
        const activationKey = calculateActId(hwid);

        // Generate response signature
        const responseSignature = generateSignature({ activationKey });

        // Return response with signature
        return res.status(200).json({
            activationKey,
            signature: responseSignature
        });
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}