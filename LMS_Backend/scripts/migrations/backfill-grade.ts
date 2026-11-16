import "dotenv/config";
import mongoose from "mongoose";

import { Grade } from "../../src/interfaces/grade";
import { Student } from "../../src/student/student-model";
import { Course } from "../../src/course/course-model";
import { Group } from "../../src/group/group-model";

const DB_URL = process.env.DB_URL;
const DB_NAME = process.env.DB_NAME;

const APPLY_MIGRATION =
    process.env.APPLY_GRADE_MIGRATION === "true";

const CONFIRM_MIGRATION =
    process.env.CONFIRM_GRADE_MIGRATION ===
    "I_UNDERSTAND_LMS_PRODUCTION_WRITE";

const legacyGrade = Grade.ThirdSecondary;
const allowedGrades = Object.values(Grade);

const targets = [
    { label: "students", collection: Student.collection },
    { label: "courses", collection: Course.collection },
    { label: "groups", collection: Group.collection },
];

const missingGradeFilter = {
    $or: [
        { grade: { $exists: false } },
        { grade: null },
    ],
};

async function runMigration(): Promise<void> {
    if (!DB_URL || !DB_NAME) {
        throw new Error("DB_URL and DB_NAME must be configured.");
    }

    // Production-only migration guard.
    if (DB_NAME !== "LMS") {
        throw new Error(
            `Migration blocked: expected LMS, received "${DB_NAME}".`
        );
    }

    if (DB_URL.includes("127.0.0.1") || DB_URL.includes("localhost")) {
        throw new Error(
            "Migration blocked: local database connection is not allowed."
        );
    }

    if (APPLY_MIGRATION && !CONFIRM_MIGRATION) {
        throw new Error(
            "Migration blocked: production write confirmation is missing."
        );
    }

    console.log("Target database:", DB_NAME);
    console.log("Mode:", APPLY_MIGRATION ? "WRITE" : "DRY RUN");

    await mongoose.connect(DB_URL, {
        dbName: DB_NAME,
    });

    console.log("MongoDB connected successfully.");

    // Check existing grade values.
    const invalidGradeCounts = await Promise.all(
        targets.map(async ({ label, collection }) => ({
            collection: label,
            count: await collection.countDocuments({
                grade: {
                    $exists: true,
                    $ne: null,
                    $nin: allowedGrades,
                },
            }),
        }))
    );

    const invalidRecords = invalidGradeCounts.filter(
        ({ count }) => count > 0
    );

    if (invalidRecords.length > 0) {
        console.error("Unexpected grade values found:");
        console.table(invalidRecords);

        throw new Error(
            "Migration stopped. Review invalid grade values."
        );
    }

    // Preview missing grades.
    const preview = await Promise.all(
        targets.map(async ({ label, collection }) => ({
            collection: label,
            recordsMissingGrade:
                await collection.countDocuments(missingGradeFilter),
        }))
    );

    console.log("Records that would be assigned third_secondary:");
    console.table(preview);

    if (!APPLY_MIGRATION) {
        console.log("DRY RUN completed. No data was changed.");
        return;
    }

    // Apply migration.
    for (const { label, collection } of targets) {
        const result = await collection.updateMany(
            missingGradeFilter,
            {
                $set: { grade: legacyGrade },
            }
        );

        console.log(
            `${label}: matched ${result.matchedCount}, modified ${result.modifiedCount}`
        );
    }

    // Verify migration.
    const remaining = await Promise.all(
        targets.map(async ({ label, collection }) => ({
            collection: label,
            recordsStillMissingGrade:
                await collection.countDocuments(missingGradeFilter),
        }))
    );

    console.log("Post-migration verification:");
    console.table(remaining);

    if (
        remaining.some(
            ({ recordsStillMissingGrade }) =>
                recordsStillMissingGrade > 0
        )
    ) {
        throw new Error(
            "Migration completed with records still missing grade."
        );
    }

    console.log("Grade migration completed successfully.");
}

runMigration()
    .catch((error: unknown) => {
        console.error("Grade migration failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });