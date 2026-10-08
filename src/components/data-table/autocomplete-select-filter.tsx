import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useFilterLabelStore } from '@/stores/filter-label-store'
import { X, ChevronsUpDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AutocompleteOption {
  value: string
  label: string
  secondaryLabel?: string
}

export interface CustomQueryConfig {
  query: any
  dataPath: string
  totalCountPath: string
  labelField: string
  valueField: string
  searchField?: string
  pageSize?: number
}

export type TypedCustomQueryConfig = CustomQueryConfig

interface AutocompleteSelectFilterProps {
  value: string | string[]
  onChange: (value: string | string[]) => void
  options?: AutocompleteOption[]
  customQuery?: CustomQueryConfig
  isMulti?: boolean
  placeholder?: string
}

// Apollo Client 4 validates the document even when `skip` is true, so a static-options
// instance (no customQuery) must still hand useQuery a parsed, never-executed query.
const AUTOCOMPLETE_NOOP_QUERY = gql`
  query AutocompleteNoop {
    __typename
  }
`

export function AutocompleteSelectFilter({
  value,
  onChange,
  options: staticOptions,
  customQuery,
  isMulti = false,
  placeholder = 'Search...',
}: AutocompleteSelectFilterProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('')
  const [allItems, setAllItems] = useState<AutocompleteOption[]>(
    staticOptions || []
  )
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { setLabels } = useFilterLabelStore()

  // GraphQL query execution
  const { loading: queryLoading, data } = useQuery(
    customQuery?.query ?? AUTOCOMPLETE_NOOP_QUERY,
    {
      skip: !customQuery,
      variables: customQuery
        ? {
            search: debouncedSearchValue,
            limit: customQuery.pageSize || 100,
          }
        : undefined,
      fetchPolicy: 'cache-and-network',
    }
  )

  // Debounce search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchValue(searchValue)
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchValue])

  // Process GraphQL data
  useEffect(() => {
    if (!customQuery || !data) return

    const items = getNestedValue(data, customQuery.dataPath) || []
    const mappedItems = items.map((item: any) => ({
      value: item[customQuery.valueField],
      label: item[customQuery.labelField],
      secondaryLabel: item.secondaryLabel,
    }))

    setAllItems(mappedItems)

    // Cache labels
    const labelMap = mappedItems.reduce(
      (acc: Record<string, string>, item: AutocompleteOption) => {
        acc[item.value] = item.label
        return acc
      },
      {}
    )
    setLabels(labelMap)
  }, [data, customQuery, setLabels])

  const selectedValues = Array.isArray(value) ? value : value ? [value] : []

  const handleToggle = useCallback(
    (itemValue: string) => {
      if (isMulti) {
        const newValues = selectedValues.includes(itemValue)
          ? selectedValues.filter((v) => v !== itemValue)
          : [...selectedValues, itemValue]
        onChange(newValues)
      } else {
        onChange(selectedValues.includes(itemValue) ? '' : itemValue)
        setOpen(false)
      }
    },
    [selectedValues, onChange, isMulti]
  )

  const handleRemove = (itemValue: string) => {
    if (isMulti) {
      onChange(selectedValues.filter((v) => v !== itemValue))
    } else {
      onChange('')
    }
  }

  const displayItems = debouncedSearchValue
    ? allItems.filter((item) =>
        item.label.toLowerCase().includes(debouncedSearchValue.toLowerCase())
      )
    : allItems

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <div className="flex flex-wrap gap-1 overflow-hidden text-left">
            {selectedValues.length > 0 ? (
              selectedValues.map((v) => {
                const item = allItems.find((i) => i.value === v)
                return (
                  <Badge key={v} variant="secondary" className="flex-shrink-0">
                    {item?.label || v}
                  </Badge>
                )
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 flex-shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="border-0 border-b rounded-none"
          />
          <CommandList>
            <ScrollArea className="h-64 w-full">
              {queryLoading && (
                <CommandEmpty className="py-4 text-center text-sm">
                  Loading...
                </CommandEmpty>
              )}
              {!queryLoading && displayItems.length === 0 && (
                <CommandEmpty className="py-4 text-center text-sm">
                  No items found
                </CommandEmpty>
              )}
              {displayItems.length > 0 && (
                <CommandGroup>
                  {displayItems.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={item.value}
                      onSelect={() => handleToggle(item.value)}
                      className="cursor-pointer"
                    >
                      {isMulti && (
                        <Checkbox
                          checked={selectedValues.includes(item.value)}
                          onCheckedChange={() => handleToggle(item.value)}
                          className="mr-2"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      {!isMulti && (
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedValues.includes(item.value)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        {item.secondaryLabel && (
                          <div className="text-xs text-muted-foreground">
                            {item.secondaryLabel}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </ScrollArea>
          </CommandList>
        </Command>
      </PopoverContent>

      {isMulti && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedValues.map((v) => {
            const item = allItems.find((i) => i.value === v)
            return (
              <Badge
                key={v}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {item?.label || v}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemove(v)
                  }}
                  className="ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </Popover>
  )
}

// Helper to get nested value from object
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

export { AutocompleteSelectFilter as DataTableAutocompleteSelectFilter }
