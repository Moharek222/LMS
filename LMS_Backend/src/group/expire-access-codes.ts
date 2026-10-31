import cron from "node-cron";
import { AccessCode, Status } from "../access-code/access-code-model";

const expireAccessCodes = async (): Promise<void> => {
    try {
        const now = new Date();

        const result = await AccessCode.updateMany(
            {
                status: Status.Active,
                expiresAt: { $lte: now }
            },
            {
                $set: { status: Status.Expired }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(
                `Expired access codes: ${result.modifiedCount}`
            );
        }

    } catch (error) {
        console.error("Failed to expire access codes:", error);
    }
};

export const startExpireAccessCodesJob = () => {
    // Run once on startup to handle any missed expirations.
    void expireAccessCodes();

    return cron.schedule(
        "*/5 * * * *",
        expireAccessCodes,
        {
            name: "expire-access-codes",
            timezone: "Africa/Cairo",
            noOverlap: true
        }
    );
};