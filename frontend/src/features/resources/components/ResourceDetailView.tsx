"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { ResourceDetail, ResourceRecommendation } from "@/features/resources/types/resources";
import { BackIcon, ChevronDownSmallIcon } from "@/features/resources/components/ResourceIcons";
import { cn } from "@/shared/utils/cn";

type ResourceDetailViewProps = {
  detail: ResourceDetail;
};

export function ResourceDetailView({ detail }: ResourceDetailViewProps) {
  return (
    <section className="app-shell-box space-y-6 rounded-3xl px-5 py-6 md:px-8 md:py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/resources"
            className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#E4D7F7] bg-white text-brand transition hover:bg-[#F6F1FF]"
            aria-label="Back to resources"
          >
            <BackIcon />
          </Link>
          <div>
            <p className="text-xs font-bold tracking-wide text-[#19226880] uppercase">
              {detail.category}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-navy md:text-3xl">
              {detail.name}
            </h1>
            <p className="mt-2 text-base text-navy md:text-lg">
              {detail.subtitle}
            </p>
          </div>
        </div>

        <StatusBadge status={detail.status} />
      </div>

      <div className="h-px bg-[#E4D7F7]" />

      <div className="grid gap-6 xl:grid-cols-2">
        <DetailCard eyebrow="Overview" title="Resource details">
          <div className="grid gap-5 sm:grid-cols-2">
            <DetailField label="Subscription" value={detail.subscription} />
            <DetailField label="Resource Group" value={detail.resourceGroup} />
            <DetailField label="Region" value={detail.region} />
            <DetailField label="SKU / TIER" value={detail.sku} />
            <DetailField label="Kind" value={detail.kind} />
            <DetailField label="Last Scanned" value={detail.lastScanned} />
          </div>
        </DetailCard>

        <DetailCard eyebrow="Cost" title="Current Monthly Cost">
          <p className="text-4xl font-bold text-[#7013D4] md:text-5xl">
            {detail.monthlyCost}
          </p>
          <Link
            href="/opportunities"
            className="mt-6 inline-flex text-sm font-bold text-[#983DFA] underline underline-offset-4"
          >
            View recommendations →
          </Link>
        </DetailCard>
      </div>

      <DetailCard
        eyebrow="Deep Configuration"
        title="Enrichment"
        action={detail.enrichment.enrichedAt}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="Replicas" value={detail.enrichment.replicas} />
          <DetailField
            label="Total Search Units"
            value={detail.enrichment.totalSearchUnits}
          />
          <DetailField
            label="Semantic Search"
            value={detail.enrichment.semanticSearch}
          />
          <DetailField label="Partitions" value={detail.enrichment.partitions} />
          <DetailField
            label="Hosting Mode"
            value={detail.enrichment.hostingMode}
          />
          <DetailField label="Status" value={detail.enrichment.status} />
        </div>
      </DetailCard>

      <DetailCard eyebrow="Workload Evidence" title="Usage">
        <p className="text-sm leading-relaxed text-[#8C52FB] md:text-base">
          {detail.usageMessage}
        </p>
      </DetailCard>

      <DetailCard eyebrow="Opportunities" title="Recommendations for this resource">
        <div className="space-y-4">
          {detail.recommendations.map((item) => (
            <ResourceRecommendationCard key={item.id} item={item} />
          ))}
        </div>
      </DetailCard>
    </section>
  );
}

function StatusBadge({ status }: { status: ResourceDetail["status"] }) {
  return (
    <span className="rounded-full border border-[#008241] bg-[#00AD5714] px-4 py-1.5 text-xs font-bold tracking-wide text-[#008241] uppercase">
      {status}
    </span>
  );
}

type DetailCardProps = {
  eyebrow: string;
  title: string;
  action?: string;
  children: ReactNode;
};

function DetailCard({ eyebrow, title, action, children }: DetailCardProps) {
  return (
    <article className="app-box rounded-2xl px-5 py-5 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#19226880]">{eyebrow}</p>
          <h3 className="mt-1 text-2xl font-bold text-navy md:text-3xl">{title}</h3>
        </div>
        {action ? (
          <p className="text-xs font-medium text-navy/50">{action}</p>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-navy">{label}</p>
      <p className="mt-1 text-base font-bold text-[#7013D4]">{value}</p>
    </div>
  );
}

function ResourceRecommendationCard({ item }: { item: ResourceRecommendation }) {
  return (
    <div className="rounded-2xl border border-[#E4D7F7] bg-[#FFFFFF80] px-4 py-4 md:px-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <h4 className="text-lg font-bold text-[#5F01C3]">{item.title}</h4>
          <p className="mt-2 text-sm leading-relaxed text-navy">
            {item.description}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full border px-3 py-1 text-[10px] font-semibold tracking-wide uppercase",
            item.confidence === "high"
              ? "border-[#008241] bg-[#00AD5714] text-[#008241]"
              : "border-[#9A7202] bg-[#FFF8E6] text-[#9A7202]",
          )}
        >
          {item.confidence === "high" ? "HIGH CONFIDENCE" : "MEDIUM CONFIDENCE"}
        </span>
      </div>
      <div className="mt-4 flex justify-end">
        <ChevronDownSmallIcon className="text-brand" />
      </div>
    </div>
  );
}
