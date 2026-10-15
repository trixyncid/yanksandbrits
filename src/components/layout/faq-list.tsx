"use client";

import { track } from "@/lib/analytics/track";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

export function FaqList({ items }: { items: { id: string; question: string; answer: string; paragraphs?: string[] }[] }) {
  return (
    <Accordion.Root
      type="single"
      collapsible
      className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white"
      onValueChange={(value) => {
        if (value) track({ name: "faq_expand", id: value });
      }}
    >
      {items.map((item) => (
        <Accordion.Item key={item.id} value={item.id}>
          <Accordion.Header>
            <Accordion.Trigger className="group flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold transition-colors hover:bg-logo-soft/60">
              {item.question}
              <ChevronDown className="size-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" aria-hidden="true" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="accordion-content overflow-hidden">
            <div className="grid gap-3 px-5 pb-5 text-base leading-7 text-muted">
              {(item.paragraphs ?? [item.answer]).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
