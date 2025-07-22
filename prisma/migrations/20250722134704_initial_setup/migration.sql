-- CreateTable
CREATE TABLE "v2_users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "permissions" JSONB,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_clients" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "customerId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "cylinderType" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_bookings" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "couponId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_bookingServices" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "v2_bookingServices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "asaasPaymentId" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "finalAmount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT NOT NULL,
    "paymentProofUrl" TEXT,
    "verifiedBy" TEXT,
    "verificationNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_paymentProofs" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_paymentProofs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "minimumAmount" DECIMAL(10,2),
    "maxUsage" INTEGER,
    "currentUsage" INTEGER NOT NULL DEFAULT 0,
    "maxUsagePerUser" INTEGER,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_couponUsages" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_couponUsages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_apiKeys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "permissions" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_apiKeys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_auditLogs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "v2_auditLogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "v2_paymentMethods" (
    "id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "fixedFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "percentageFee" DECIMAL(5,4) NOT NULL DEFAULT 0,
    "passFeesToClient" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "v2_paymentMethods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "v2_users_email_key" ON "v2_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "v2_roles_name_key" ON "v2_roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "v2_clients_externalId_key" ON "v2_clients"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "v2_clients_cpf_key" ON "v2_clients"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "v2_coupons_code_key" ON "v2_coupons"("code");

-- CreateIndex
CREATE UNIQUE INDEX "v2_paymentMethods_method_key" ON "v2_paymentMethods"("method");

-- AddForeignKey
ALTER TABLE "v2_bookings" ADD CONSTRAINT "v2_bookings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "v2_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_bookings" ADD CONSTRAINT "v2_bookings_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "v2_coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_bookingServices" ADD CONSTRAINT "v2_bookingServices_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "v2_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_bookingServices" ADD CONSTRAINT "v2_bookingServices_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "v2_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_payments" ADD CONSTRAINT "v2_payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "v2_bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_payments" ADD CONSTRAINT "v2_payments_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "v2_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_paymentProofs" ADD CONSTRAINT "v2_paymentProofs_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "v2_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_couponUsages" ADD CONSTRAINT "v2_couponUsages_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "v2_coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_couponUsages" ADD CONSTRAINT "v2_couponUsages_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "v2_bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_couponUsages" ADD CONSTRAINT "v2_couponUsages_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "v2_clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_apiKeys" ADD CONSTRAINT "v2_apiKeys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "v2_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "v2_auditLogs" ADD CONSTRAINT "v2_auditLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "v2_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
