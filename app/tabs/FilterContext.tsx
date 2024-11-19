import React, { createContext, useContext, useState } from 'react';

// Define the type for the filters object
interface Filters {
  city?: string;
  price?: string;
  propertyType?: string[];
  occupants?: number;
  rooms?: number;
  petsAllowed?: boolean;
}

// Create the context with the defined filters type
const FilterContext = createContext<{
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
} | null>(null);

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFilters] = useState<Filters>({});

  return (
    <FilterContext.Provider value={{ filters, setFilters }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  
  // If context is not available, return an empty object to avoid errors
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }

  return context;
};
