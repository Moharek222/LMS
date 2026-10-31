import "dotenv/config";
import mongoose from "mongoose";

import { Grade } from "../../src/interfaces/grade";
import { Student } from "../../src/student/student-model";
import { Course } from "../../src/course/course-model";
import { Group } from "../../src/group/group-model";

const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;
const APPLY_MIGRATION = process.env.APPLY_GRADE_MIGRATION === "true";

if (!DB_URL || !DB_NAME) {
    throw new Error("DB_URL and DB_NAME must be set in the environment.");
}
// Safety guard: this migration is allowed only on the local staging database.
if (DB_NAME !== "LMS_staging") {
    throw new Error(
        `Migration blocked: expected LMS_staging, received "${DB_NAME}".`,
    );
}

if (!DB_URL.startsWith("mongodb://127.0.0.1:27018")) {
    throw new Error(
        "Migration blocked: expected the local MongoDB server at 127.0.0.1:27018.",
    );
}
const allowedGrades = Object.values(Grade);
const legacyGrade = Grade.ThirdSecondary;

const targets = [
    { label: "students", collection: Student.collection },
    { label: "courses", collection: Course.collection },
    { label: "groups", collection: Group.collection },
];

const missingGradeFilter = {
    $or: [{ grade: { $exists: false } }, { grade: null }],
};

async function runMigration(): Promise<void> {
    await mongoose.connect(DB_URL!, { dbName: DB_NAME! });
    console.log(`Connected to MongoDB database: ${DB_NAME}`);
    console.log(`Mode: ${APPLY_MIGRATION ? "WRITE" : "DRY RUN"}`);

    // Stop before writing if any record already has an unexpected non-null grade.
    const invalidGradeCounts = await Promise.all(
        targets.map(async ({ label, collection }) => ({
            label,
            count: await collection.countDocuments({
                grade: {
                    $exists: true,
                    $ne: null,
                    $nin: allowedGrades,
                },
            }),
        })),
    );

    const invalidRecords = invalidGradeCounts.filter(({ count }) => count > 0);
    if (invalidRecords.length > 0) {
        console.error("Migration stopped: unexpected existing grade values were found.");
        console.table(invalidRecords);
        throw new Error("Review invalid grade values before running the backfill.");
    }

    const preview = await Promise.all(
        targets.map(async ({ label, collection }) => ({
            collection: label,
            recordsMissingGrade: await collection.countDocuments(missingGradeFilter),
        })),
    );

    console.log("Records that would be assigned third_secondary:");
    console.table(preview);

    if (!APPLY_MIGRATION) {
        console.log(
            'Dry run only. No data was changed. Set APPLY_GRADE_MIGRATION="true" to apply the backfill.',
        );
        return;
    }

    // This is intentionally idempotent: only records missing grade or storing null are updated.
    for (const { label, collection } of targets) {
        const result = await collection.updateMany(missingGradeFilter, {
            $set: { grade: legacyGrade },
        });

        console.log(
            `${label}: matched ${result.matchedCount}, modified ${result.modifiedCount}`,
        );
    }

    const remaining = await Promise.all(
        targets.map(async ({ label, collection }) => ({
            collection: label,
            recordsStillMissingGrade: await collection.countDocuments(missingGradeFilter),
        })),
    );

    console.log("Post-migration verification:");
    console.table(remaining);

    if (remaining.some(({ recordsStillMissingGrade }) => recordsStillMissingGrade > 0)) {
        throw new Error("Backfill finished with records still missing grade. Investigate before deployment.");
    }

    console.log("Grade backfill completed successfully.");
}

runMigration()
    .catch((error: unknown) => {
        console.error("Grade migration failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
