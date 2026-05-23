-- CreateTable
CREATE TABLE "ClientApp" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientApp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientScope" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ClientScope_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientApp_name_key" ON "ClientApp"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ClientScope_clientId_scope_key" ON "ClientScope"("clientId", "scope");

-- AddForeignKey
ALTER TABLE "ClientScope" ADD CONSTRAINT "ClientScope_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientApp"("id") ON DELETE CASCADE ON UPDATE CASCADE;
