/*
  Warnings:

  - A unique constraint covering the columns `[objectiveId]` on the table `OKRVector` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `objectiveId` to the `OKRVector` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OKRVector" ADD COLUMN     "objectiveId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "OKRVector_objectiveId_key" ON "OKRVector"("objectiveId");

-- AddForeignKey
ALTER TABLE "OKRVector" ADD CONSTRAINT "OKRVector_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
