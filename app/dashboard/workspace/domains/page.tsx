"use client";

import { Globe } from "lucide-react";
import { PageContainer, PageHeader, Card, Badge, EmptyState } from "../../components";

export default function DomainsPage() {
  return (
    <PageContainer>
      <PageHeader title="Custom Domains" description="Connect custom domains to your workspace" />

      <Card
        title="Domains"
        action={<Badge variant="gold">Coming Soon</Badge>}
      >
        <EmptyState
          icon={Globe}
          title="Custom domains coming soon"
          description="Connect your own domain to access Tirbeo with your brand"
        />
      </Card>
    </PageContainer>
  );
}
