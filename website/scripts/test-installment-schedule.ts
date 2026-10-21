import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type Stripe from "stripe";
import {
  endInstallmentSubscription,
  setStripeForTests,
} from "../lib/coaching/stripe";

const start = Math.floor(Date.UTC(2026, 0, 15) / 1000);

function plusMonths(unix: number, months: number): number {
  const date = new Date(unix * 1000);
  date.setUTCMonth(date.getUTCMonth() + months);
  return Math.floor(date.getTime() / 1000);
}

afterEach(() => {
  setStripeForTests(undefined);
});

describe("endInstallmentSubscription", () => {
  it("cancels after exactly 3 monthly invoices", async () => {
    let updates = 0;
    setStripeForTests({
      subscriptions: {
        retrieve: async () => ({
          id: "sub_test",
          schedule: null,
          items: { data: [{ price: { id: "price_test" } }] },
        }),
      },
      subscriptionSchedules: {
        create: async (params: { from_subscription?: string }) => {
          assert.equal(params.from_subscription, "sub_test");
          return { id: "sched_1" };
        },
        retrieve: async () => {
          if (updates === 0) {
            return {
              id: "sched_1",
              end_behavior: "release",
              phases: [{ start_date: start, end_date: plusMonths(start, 12) }],
            };
          }
          return {
            id: "sched_1",
            end_behavior: "cancel",
            phases: [{ start_date: start, end_date: plusMonths(start, 3) }],
          };
        },
        update: async (
          id: string,
          params: {
            end_behavior?: string;
            phases?: Array<{
              duration?: { interval?: string; interval_count?: number };
              start_date?: number;
              items?: Array<{ price?: string; quantity?: number }>;
            }>;
          }
        ) => {
          updates += 1;
          assert.equal(id, "sched_1");
          assert.equal(params.end_behavior, "cancel");
          assert.equal(params.phases?.[0]?.start_date, start);
          assert.equal(params.phases?.[0]?.items?.[0]?.price, "price_test");
          assert.equal(params.phases?.[0]?.duration?.interval, "month");
          assert.equal(params.phases?.[0]?.duration?.interval_count, 3);
          return { id };
        },
      },
    } as unknown as Stripe);

    await endInstallmentSubscription({
      subscriptionId: "sub_test",
      iterations: 3,
    });
    assert.equal(updates, 1);
  });

  it("does not accept a schedule that would keep billing", async () => {
    setStripeForTests({
      subscriptions: {
        retrieve: async () => ({
          id: "sub_open",
          schedule: "sched_open",
          items: { data: [{ price: { id: "price_test" } }] },
        }),
      },
      subscriptionSchedules: {
        retrieve: async () => ({
          id: "sched_open",
          end_behavior: "release",
          phases: [{ start_date: start, end_date: plusMonths(start, 12) }],
        }),
        update: async () => ({ id: "sched_open" }),
      },
    } as unknown as Stripe);

    await assert.rejects(
      () =>
        endInstallmentSubscription({
          subscriptionId: "sub_open",
          iterations: 6,
        }),
      /not bounded/
    );
  });
});
