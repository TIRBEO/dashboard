import { AuditAction, type AuditEvent } from "@tirbeo/types";

export interface AuditInput {
  actorId?: string;
  organizationId?: string;
  applicationId?: string;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  result?: string;
}

export async function createAuditEvent(input: AuditInput): Promise<AuditEvent> {
  const event: AuditEvent = {
    id: crypto.randomUUID(),
    actorId: input.actorId ?? null,
    organizationId: input.organizationId ?? null,
    applicationId: input.applicationId ?? null,
    action: input.action,
    targetType: input.targetType ?? null,
    targetId: input.targetId ?? null,
    beforeState: input.beforeState ?? null,
    afterState: input.afterState ?? null,
    metadata: input.metadata ?? {},
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    requestId: input.requestId ?? null,
    result: input.result ?? null,
    createdAt: new Date().toISOString(),
  };

  return event;
}

export async function listAuditEvents(options: {
  limit?: number;
  offset?: number;
  action?: string;
  actorId?: string;
  organizationId?: string;
  targetType?: string;
  severity?: string;
  from?: string;
  to?: string;
}) {
  const where: Record<string, unknown> = {};
  if (options.action) where.action = { contains: options.action };
  if (options.actorId) where.actorId = options.actorId;
  if (options.organizationId) where.organizationId = options.organizationId;
  if (options.targetType) where.targetType = options.targetType;
  if (options.from || options.to) {
    const createdAt: Record<string, Date> = {};
    if (options.from) createdAt.gte = new Date(options.from);
    if (options.to) createdAt.lte = new Date(options.to);
    where.createdAt = createdAt;
  }

  const limit = Math.min(options.limit ?? 50, 200);
  const offset = options.offset ?? 0;

  return { events: [] as AuditEvent[], total: 0, limit, offset };
}
