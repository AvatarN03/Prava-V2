"use client";

import Link from "next/link";
import { useState } from "react";

import {
  ArrowRight,
  Calendar,
  Check,
  Download,
  Filter,
  Layers,
  MapPin,
  Search,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { ChecklistItem, Expense, ItineraryItem, Trip } from "@prisma/client";

interface TripsOperationsTableProps {
  trips: (Trip & {
    itinerary?: ItineraryItem[];
    expenses?: Expense[];
    checklistItems?: ChecklistItem[];
  })[];
}

export function TripsOperationsTable({ trips }: TripsOperationsTableProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  const counts = {
    ALL: trips.length,
    ACTIVE: trips.filter((t) => t.status === "ACTIVE").length,
    PLANNING: trips.filter((t) => t.status === "PLANNING").length,
    COMPLETED: trips.filter((t) => t.status === "COMPLETED").length,
  };

  const filteredTrips = trips.filter((trip) => {
    if (selectedFilter !== "ALL" && trip.status !== selectedFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = trip.title.toLowerCase().includes(q);
      const matchDest = trip.destination?.toLowerCase().includes(q) ?? false;
      return matchTitle || matchDest;
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (Object.keys(selectedRows).length === filteredTrips.length) {
      setSelectedRows({});
    } else {
      const all: Record<string, boolean> = {};
      filteredTrips.forEach((t) => {
        all[t.id] = true;
      });
      setSelectedRows(all);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Active Journey
          </span>
        );
      case "PLANNING":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            Planning
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Sub-Navigation Filter Tabs Row matching Screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        {/* Filter Pills / Underline Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none text-xs">
          {(
            [
              { id: "ALL", label: "All Cases / Trips", count: counts.ALL },
              { id: "ACTIVE", label: "Active", count: counts.ACTIVE },
              { id: "PLANNING", label: "Planning Stage", count: counts.PLANNING },
              { id: "COMPLETED", label: "Completed", count: counts.COMPLETED },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                selectedFilter === tab.id
                  ? "bg-[#2D9BF0] text-white shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  selectedFilter === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Right Toolbar: Search & Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#2D9BF0] w-36 sm:w-44 transition-all"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs border-slate-200 dark:border-slate-800"
          >
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <span>Filters</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs border-slate-200 dark:border-slate-800 hidden sm:inline-flex"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Interactive Operations Table Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Header */}
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredTrips.length > 0 &&
                      Object.keys(selectedRows).length === filteredTrips.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 dark:border-slate-700 text-[#2D9BF0] focus:ring-[#2D9BF0] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Trip Code</th>
                <th className="py-3 px-4">Title & Destination</th>
                <th className="py-3 px-4">Schedule / Dates</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Expenses Reconciled</th>
                <th className="py-3 px-4">Readiness Progress</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-200">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No travel workspaces match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip, idx) => {
                  const tripCode = `#TRIP-${trip.id.substring(0, 5).toUpperCase()}`;
                  const isChecked = !!selectedRows[trip.id];
                  const spend =
                    trip.expenses?.reduce((acc, curr) => acc + curr.amount, 0) ?? 0;
                  const totalTasks = trip.checklistItems?.length ?? 0;
                  const completedTasks =
                    trip.checklistItems?.filter((t) => t.isCompleted).length ?? 0;
                  const progressPct =
                    totalTasks > 0
                      ? Math.round((completedTasks / totalTasks) * 100)
                      : trip.status === "COMPLETED"
                      ? 100
                      : 45;

                  const dateRange =
                    trip.startDate && trip.endDate
                      ? `${new Date(trip.startDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })} – ${new Date(trip.endDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}`
                      : "Flexible Dates";

                  return (
                    <tr
                      key={trip.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        isChecked ? "bg-sky-50/50 dark:bg-sky-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectRow(trip.id)}
                          className="rounded border-slate-300 dark:border-slate-700 text-[#2D9BF0] focus:ring-[#2D9BF0] cursor-pointer"
                        />
                      </td>

                      {/* Code */}
                      <td className="py-3 px-4 font-mono font-semibold text-[#2D9BF0]">
                        <Link
                          href={`/trips/${trip.id}`}
                          className="hover:underline"
                        >
                          {tripCode}
                        </Link>
                      </td>

                      {/* Title & Destination */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          <Link
                            href={`/trips/${trip.id}`}
                            className="hover:text-[#2D9BF0] transition-colors"
                          >
                            {trip.title}
                          </Link>
                        </div>
                        {trip.destination && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-[#2D9BF0]" />
                            <span>{trip.destination}</span>
                          </div>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{dateRange}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">{getStatusBadge(trip.status)}</td>

                      {/* Expenses */}
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-white">
                        ${spend.toFixed(2)}
                      </td>

                      {/* Progress */}
                      <td className="py-3 px-4">
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            <span>Readiness</span>
                            <span>{progressPct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <Link href={`/trips/${trip.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs font-semibold text-[#2D9BF0] hover:text-[#1D8BE0] hover:bg-sky-50 dark:hover:bg-slate-800 gap-1 px-2.5 cursor-pointer"
                          >
                            <span>Open</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
