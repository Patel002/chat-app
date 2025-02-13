import FcmToken from "../model/fcmToken.model.js";

const storeFcmToken = async(req, res) => {
    try {
        const {fcmToken, userId} = req.body;

        if(!fcmToken || !userId) {
            return res.status(400).json({message: "FCM token and receiver's id are required", success: false})
        }

        const existingToken = await FcmToken.findOne({ where: { userId } });

        if (existingToken) {
            await existingToken.update({ fcmToken: fcmToken });
            return res.status(200).json({ message: "FCM Token updated successfully", success: true, time: new Date() });
        }
        const data = await FcmToken.create({ userId: userId, fcmToken });

        console.log(data);

        return res.status(201).json({ message: "FCM Token stored successfully",data, success: true });
    } catch (error) {
        console.error("storeFcmToken error:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
}

const getFcmToken = async (req, res) => {
    try {
        const { userId } = req.params;

        const tokenEntry = await FcmToken.findOne({ where: { userId } });

        if (!tokenEntry) {
            return res.status(404).json({ message: "FCM Token not found", success: false });
        }

        return res.status(200).json({ token: tokenEntry, success: true });
    } catch (error) {
        console.error("getFcmToken error:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
};

const deleteFcmToken = async (req, res) => {
    try {
        const { userId } = req.params;

        const tokenEntry = await FcmToken.findOne({ where: { userId } });

        if (!tokenEntry) {
            return res.status(404).json({ message: "FCM Token not found", success: false });
        }
        await tokenEntry.destroy();
        return res.status(200).json({ message: "FCM Token deleted successfully", success: true });
    } catch (error) {
        console.error("deleteFcmToken error:", error);
        return res.status(500).json({ message: error.message, success: false });
    }
};


export {
    storeFcmToken,
    getFcmToken,
    deleteFcmToken
}