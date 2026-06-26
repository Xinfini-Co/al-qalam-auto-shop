import { forwardRef } from "react";
import type { JobWithRelations } from "@shared";
import Logo from "@/components/brand/Logo";
import { SHOP, CATEGORY_LABEL, TRANSPORT_LABEL, METHOD_LABEL } from "@/lib/constants";
import { splitFils, formatDate, salutationFor } from "@/lib/utils";

/**
 * Print-ready A4 estimate / tax invoice that recreates the Al Qalam paper form.
 * Always black-on-white (theme-independent) with subtle blue + gradient accents.
 * `variant="shop"` adds internal columns and a breakdown for the shop copy.
 */
export const InvoiceSheet = forwardRef<HTMLDivElement, { job: JobWithRelations; variant?: "client" | "shop" }>(
  function InvoiceSheet({ job, variant = "client" }, ref) {
    const shop = variant === "shop";
    const { client, vehicle, items, payments, totals } = job;

    return (
      <div
        ref={ref}
        className="print-sheet mx-auto w-full max-w-[800px] bg-white p-8 text-[13px] text-black"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        {/* ---------- Header band ---------- */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo variant="mark" animated={false} />
            <div>
              <h1 className="text-lg font-bold leading-tight">{SHOP.name}</h1>
              <p className="text-[11px] leading-tight text-[#2563EB]">{SHOP.tagline}</p>
              <p className="mt-1 text-[11px] leading-tight text-zinc-600">
                {SHOP.city} · {SHOP.area} · {SHOP.poBox}
              </p>
              <p className="text-[11px] leading-tight text-zinc-600">
                Mob: {SHOP.phones.join("  /  ")}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="rounded-md border border-zinc-300 px-3 py-1.5">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500">Invoice</p>
              <p className="text-xl font-bold">No. {job.jobNo}</p>
            </div>
            <p className="mt-2 text-[11px] text-zinc-600">
              Date: <span className="font-medium text-black">{formatDate(job.date)}</span>
            </p>
          </div>
        </div>

        <div className="my-3 h-[3px] w-full rounded bg-gradient-to-r from-[#E31937] via-[#9B1C8E] to-[#2563EB]" />

        <h2 className="text-center text-sm font-semibold tracking-[0.2em] text-zinc-800">
          ESTIMATE / TAX INVOICE
          {shop && <span className="ml-2 rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-bold tracking-normal text-white">SHOP COPY</span>}
        </h2>

        {/* ---------- Customer + vehicle ---------- */}
        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 border-y border-zinc-200 py-2 text-[12px]">
          <p>
            <span className="text-zinc-500">Mr./M/s.: </span>
            <span className="font-semibold">{salutationFor(client.name)} {client.name}</span>
          </p>
          <p>
            <span className="text-zinc-500">Vehicle: </span>
            <span className="font-semibold">{vehicle.makeModel}</span>
          </p>
          <p>
            <span className="text-zinc-500">Plate No.: </span>
            <span className="font-semibold">{vehicle.plateNo}</span>
          </p>
          <p>
            <span className="text-zinc-500">Transport: </span>
            <span className="font-semibold">{TRANSPORT_LABEL[job.transportType]}</span>
          </p>
          {shop && (
            <>
              <p><span className="text-zinc-500">Contact: </span><span className="font-semibold">{[client.phone1, client.phone2, client.phone3].filter(Boolean).join(", ")}</span></p>
              <p><span className="text-zinc-500">Mechanic: </span><span className="font-semibold">{job.mechanicName ?? "—"}</span></p>
              {job.promisedDate && <p><span className="text-zinc-500">Promised: </span><span className="font-semibold">{formatDate(job.promisedDate)}</span></p>}
              {vehicle.color && <p><span className="text-zinc-500">Colour: </span><span className="font-semibold">{vehicle.color}{vehicle.year ? ` · ${vehicle.year}` : ""}</span></p>}
            </>
          )}
        </div>

        {/* ---------- Items table ---------- */}
        <table className="mt-3 w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-zinc-100 text-[11px] uppercase tracking-wide text-zinc-600">
              <th className="border border-zinc-300 px-2 py-1.5 text-left w-9">S.No</th>
              <th className="border border-zinc-300 px-2 py-1.5 text-left">Description</th>
              {shop && <th className="border border-zinc-300 px-2 py-1.5 text-left w-24">Category</th>}
              <th className="border border-zinc-300 px-2 py-1.5 text-center w-10">Qty</th>
              <th className="border border-zinc-300 px-2 py-1.5 text-center" colSpan={2}>Rate</th>
              <th className="border border-zinc-300 px-2 py-1.5 text-center" colSpan={2}>Amount</th>
            </tr>
            <tr className="bg-zinc-50 text-[10px] uppercase text-zinc-500">
              <th className="border border-zinc-300" />
              <th className="border border-zinc-300" />
              {shop && <th className="border border-zinc-300" />}
              <th className="border border-zinc-300" />
              <th className="border border-zinc-300 px-1 py-0.5 text-right w-16">Dhs</th>
              <th className="border border-zinc-300 px-1 py-0.5 text-right w-9">Fils</th>
              <th className="border border-zinc-300 px-1 py-0.5 text-right w-16">Dhs</th>
              <th className="border border-zinc-300 px-1 py-0.5 text-right w-9">Fils</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => {
              const rate = splitFils(it.rate);
              const amt = splitFils(it.amount);
              return (
                <tr key={it.id}>
                  <td className="border border-zinc-300 px-2 py-1.5 text-center">{i + 1}</td>
                  <td className="border border-zinc-300 px-2 py-1.5">{it.description}</td>
                  {shop && <td className="border border-zinc-300 px-2 py-1.5 text-zinc-600">{CATEGORY_LABEL[it.category]}</td>}
                  <td className="border border-zinc-300 px-2 py-1.5 text-center">{it.qty}</td>
                  <td className="border border-zinc-300 px-1 py-1.5 text-right tabular-nums">{rate.dhs}</td>
                  <td className="border border-zinc-300 px-1 py-1.5 text-right tabular-nums text-zinc-500">{rate.fils}</td>
                  <td className="border border-zinc-300 px-1 py-1.5 text-right tabular-nums font-medium">{amt.dhs}</td>
                  <td className="border border-zinc-300 px-1 py-1.5 text-right tabular-nums text-zinc-500">{amt.fils}</td>
                </tr>
              );
            })}
            {/* pad to a consistent minimum number of rows on the printed page */}
            {Array.from({ length: Math.max(0, (shop ? 6 : 8) - items.length) }).map((_, i) => (
              <tr key={`pad-${i}`}>
                <td className="border border-zinc-300 px-2 py-1.5 text-center text-transparent">.</td>
                <td className="border border-zinc-300" />
                {shop && <td className="border border-zinc-300" />}
                <td className="border border-zinc-300" />
                <td className="border border-zinc-300" />
                <td className="border border-zinc-300" />
                <td className="border border-zinc-300" />
                <td className="border border-zinc-300" />
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-semibold">
              <td className="border border-zinc-300 px-2 py-1.5 text-right" colSpan={shop ? 5 : 4}>Total Dhs</td>
              <td className="border border-zinc-300 px-1 py-1.5 text-right tabular-nums">{splitFils(totals.total).dhs}</td>
              <td className="border border-zinc-300 px-1 py-1.5 text-right tabular-nums text-zinc-500">{splitFils(totals.total).fils}</td>
              <td className="border border-zinc-300" />
            </tr>
            <tr>
              <td className="border border-zinc-300 px-2 py-1.5 text-right" colSpan={shop ? 5 : 4}>Amount Paid</td>
              <td className="border border-zinc-300 px-1 py-1.5 text-right tabular-nums">{splitFils(totals.paid).dhs}</td>
              <td className="border border-zinc-300 px-1 py-1.5 text-right tabular-nums text-zinc-500">{splitFils(totals.paid).fils}</td>
              <td className="border border-zinc-300" />
            </tr>
            <tr className="font-bold">
              <td className="border border-zinc-300 px-2 py-1.5 text-right text-[#E31937]" colSpan={shop ? 5 : 4}>Remaining Balance</td>
              <td className="border border-zinc-300 px-1 py-1.5 text-right tabular-nums text-[#E31937]">{splitFils(totals.balance).dhs}</td>
              <td className="border border-zinc-300 px-1 py-1.5 text-right tabular-nums text-[#E31937]">{splitFils(totals.balance).fils}</td>
              <td className="border border-zinc-300" />
            </tr>
          </tfoot>
        </table>

        {/* ---------- Shop-only extras ---------- */}
        {shop && (
          <div className="mt-3 grid grid-cols-2 gap-4 text-[11px]">
            <div className="rounded border border-zinc-300 p-2">
              <p className="mb-1 font-semibold uppercase tracking-wide text-zinc-500">Internal notes</p>
              <p className="text-zinc-700">{job.notes || "—"}</p>
            </div>
            <div className="rounded border border-zinc-300 p-2">
              <p className="mb-1 font-semibold uppercase tracking-wide text-zinc-500">Payments</p>
              {payments.length === 0 ? (
                <p className="text-zinc-700">No payments recorded.</p>
              ) : (
                <ul className="space-y-0.5">
                  {payments.map((p) => (
                    <li key={p.id} className="flex justify-between">
                      <span className="text-zinc-700">{formatDate(p.date)} · {METHOD_LABEL[p.method]}</span>
                      <span className="tabular-nums">{splitFils(p.amount).dhs}.{splitFils(p.amount).fils}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ---------- Footer ---------- */}
        <div className="mt-10 flex items-end justify-between text-[12px]">
          <div className="w-44 border-t border-zinc-400 pt-1 text-center text-zinc-600">Receiver&apos;s Signature</div>
          <p className="text-[10px] text-zinc-400">Thank you for your business · {SHOP.shortName}</p>
          <div className="w-44 border-t border-zinc-400 pt-1 text-center text-zinc-600">Signature</div>
        </div>
      </div>
    );
  },
);
