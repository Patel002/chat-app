import crypto from "crypto";

const algorithm = 'aes-256-cbc';
const key = Buffer.from('de568fc97a511aea9bc27b068c50a3b81ad4773114c176b78995c266c8bea098', 'hex');

const iv = crypto.randomBytes(16);
const encryptMessages = (content) => {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(content, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    const encryptedMessage = `${iv.toString('hex')}:${encrypted}`;
    return (encryptedMessage)
}

const decryptMessages = (encryptedMessages) => {
    try {
        if (encryptedMessages.includes(':')) {
            const [ivHex, encrypted] = encryptedMessages.split(':');
            if (!ivHex || !encrypted) {
                throw new Error("Invalid encrypted encryptedMessages format");
            }
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            const decryptedBuffer = Buffer.concat([
                decipher.update(Buffer.from(encrypted, 'hex')),
                decipher.final()
            ]);
            return decryptedBuffer.toString('utf-8');
        } else {
            return encryptedMessages;
        }
    } catch (error) {
        console.error("Decryption failed:", error.message);
        throw new Error("Decryption error");
    }
};


export {
    encryptMessages,
    decryptMessages
}