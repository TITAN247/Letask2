import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    messageId: {
        type: String,
        required: false // Agora specific tracking token
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false 
    },
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    messageText: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true, strict: false }); 

// Violently purge the Next.js HMR Cache so it fundamentally accepts the new architectural changes natively
if (mongoose.models.Message) {
    delete mongoose.models.Message;
}
export default mongoose.model('Message', MessageSchema);
