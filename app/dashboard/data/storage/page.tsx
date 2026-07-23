"use client";

import { Cloud } from "lucide-react";
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  EmptyState,
} from "../../components";

export default function DataStoragePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Connected Storage"
        description="Manage external storage providers"
      />

      <Card>
        <EmptyState
          icon={Cloud}
          title="No storage providers connected"
          description="Connect S3, Google Cloud Storage, or other providers"
          action={<Button variant="gold">Connect Storage Provider</Button>}
        />
      </Card>
    </PageContainer>
  );
}
