"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchInput } from "@/components/ui/search-input";
import { SportSelect } from "@/components/ui/sport-select";
import { ChevronDownIcon, FilterIcon, XIcon } from "lucide-react";
import { useState } from "react";

export interface AthletesFilterState {
  search: string;
  sport: string;
  sortBy: "name" | "sport" | "createdAt";
  sortOrder: "asc" | "desc";
}

interface AthletesFilterBarProps {
  filters: AthletesFilterState;
  onFiltersChangeAction: (filters: AthletesFilterState) => void;
}

const SORT_OPTIONS = [
  { value: "name", label: "Name (A-Z)", order: "asc" as const },
  { value: "name", label: "Name (Z-A)", order: "desc" as const },
  { value: "sport", label: "Sport (A-Z)", order: "asc" as const },
  { value: "sport", label: "Sport (Z-A)", order: "desc" as const },
  { value: "createdAt", label: "Newest First", order: "desc" as const },
  { value: "createdAt", label: "Oldest First", order: "asc" as const },
] as const;

export function AthletesFilterBar({ filters, onFiltersChangeAction }: AthletesFilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = (updates: Partial<AthletesFilterState>) => {
    onFiltersChangeAction({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChangeAction({
      search: "",
      sport: "",
      sortBy: "name",
      sortOrder: "asc",
    });
  };

  const hasActiveFilters = filters.search || filters.sport ||
    filters.sortBy !== "name" || filters.sortOrder !== "asc";

  const currentSortOption = SORT_OPTIONS.find(
    (option) => option.value === filters.sortBy && option.order === filters.sortOrder
  );

  return (
    <div className="space-y-4">
      {/* Main filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <SearchInput
            value={filters.search}
            onChange={(value) => updateFilters({ search: value })}
            placeholder="Search athletes by name or email..."
            className="w-full"
          />
        </div>

        {/* Toggle filters button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 whitespace-nowrap"
        >
          <FilterIcon className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground ull w-2 h-2" />
          )}
        </Button>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 whitespace-nowrap"
            >
              Sort: {currentSortOption?.label || "Name (A-Z)"}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={`${option.value}-${option.order}`}
                onClick={() => updateFilters({
                  sortBy: option.value,
                  sortOrder: option.order
                })}
                className="cursor-pointer"
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-muted/50  border">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Sport</label>
            <SportSelect
              value={filters.sport}
              onChange={(value) => updateFilters({ sport: value })}
            />
          </div>

          {/* Placeholder for future filters */}
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">More filters</label>
            <div className="text-sm text-muted-foreground p-2 bg-background  border-2 border-dashed">
              Additional filters can be added here (fitness level, tags, etc.)
            </div>
          </div>

          {/* Clear filters */}
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="flex items-center gap-2"
            >
              <XIcon className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1  text-sm">
              Search: "{filters.search}"
              <Button
                variant="ghost"
                size="sm"
                className="p-0 w-4 h-4"
                onClick={() => updateFilters({ search: "" })}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </div>
          )}
          {filters.sport && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1  text-sm">
              Sport: {filters.sport}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 w-4"
                onClick={() => updateFilters({ sport: "" })}
              >
                <XIcon className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}