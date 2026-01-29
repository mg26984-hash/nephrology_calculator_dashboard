import { useState, useCallback, memo } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

// Memoized search input component that manages its own state
// This prevents parent re-renders from affecting the input focus
const SearchInput = memo(function SearchInput({ 
  onSearchChange, 
  placeholder = "Search calculators..." 
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState("");

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalValue(value);
    onSearchChange(value);
  }, [onSearchChange]);

  const handleClear = useCallback(() => {
    setLocalValue("");
    onSearchChange("");
  }, [onSearchChange]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        className="pl-9 pr-8 bg-secondary border-border"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

export default SearchInput;
