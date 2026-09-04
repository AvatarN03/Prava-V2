-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'PARTIAL');

-- CreateTable
CREATE TABLE "ai_proposals" (
    "id" UUID NOT NULL,
    "trip_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "message_id" UUID,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "summary" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "ai_proposals_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ai_proposals" ADD CONSTRAINT "ai_proposals_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_proposals" ADD CONSTRAINT "ai_proposals_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_proposals" ADD CONSTRAINT "ai_proposals_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "ai_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
