/*
  Warnings:

  - You are about to drop the column `notes` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `spentAt` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Expense` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Expense` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - Added the required column `date` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idempotencyKey` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Made the column `category` on table `Expense` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idempotencyKey" TEXT NOT NULL
);
INSERT INTO "new_Expense" ("amount", "category", "createdAt", "id") SELECT "amount", "category", "createdAt", "id" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
CREATE UNIQUE INDEX "Expense_idempotencyKey_key" ON "Expense"("idempotencyKey");
CREATE INDEX "Expense_date_idx" ON "Expense"("date");
CREATE INDEX "Expense_category_idx" ON "Expense"("category");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
