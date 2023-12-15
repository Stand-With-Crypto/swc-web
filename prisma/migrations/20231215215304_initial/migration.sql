-- CreateTable
CREATE TABLE "AuthenticationNonce" (
    "id" TEXT NOT NULL PRIMARY KEY
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "datetimeCreated" DATETIME NOT NULL,
    "datetimeUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sampleDatabaseIncrement" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");
