"use client";

import { faq } from "@/content/site";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FaqItem = { question: string; answer: string };

/** One panel; each question is a row with a chevron. Answers stay in the HTML (`hiddenUntilFound`). */
export function FAQAccordion({
  items = faq,
  className,
}: {
  items?: readonly FaqItem[];
  className?: string;
}) {
  return (
    <Accordion
      defaultValue={["item-0"]}
      className={cn("panel mx-auto max-w-3xl", className)}
    >
      {items.map((item, index) => (
        <AccordionItem key={item.question} value={`item-${index}`}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionPanel hiddenUntilFound>
            <p className="text-left">{item.answer}</p>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
