import { createContext, useContext, useState, ReactNode } from "react";

interface Hospital {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  rating?: number;
  total_reviews?: number;
  description?: string;
  bed_capacity?: number;
  established_year?: number;
  logo_url?: string;
  cover_image_url?: string;
  hospital_specialties?: { specialty_name: string }[];
  treatment_packages?: { id: string; name: string; category: string; price: number; currency: string }[];
  hospital_certifications?: { certification_name: string; issuing_body: string }[];
}

interface ComparisonContextType {
  selectedHospitals: Hospital[];
  addToComparison: (hospital: Hospital) => void;
  removeFromComparison: (hospitalId: string) => void;
  clearComparison: () => void;
  isSelected: (hospitalId: string) => boolean;
  canAddMore: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const MAX_COMPARISON = 3;

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
  const [selectedHospitals, setSelectedHospitals] = useState<Hospital[]>([]);

  const addToComparison = (hospital: Hospital) => {
    if (selectedHospitals.length < MAX_COMPARISON && !isSelected(hospital.id)) {
      setSelectedHospitals([...selectedHospitals, hospital]);
    }
  };

  const removeFromComparison = (hospitalId: string) => {
    setSelectedHospitals(selectedHospitals.filter(h => h.id !== hospitalId));
  };

  const clearComparison = () => {
    setSelectedHospitals([]);
  };

  const isSelected = (hospitalId: string) => {
    return selectedHospitals.some(h => h.id === hospitalId);
  };

  const canAddMore = selectedHospitals.length < MAX_COMPARISON;

  return (
    <ComparisonContext.Provider value={{
      selectedHospitals,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isSelected,
      canAddMore,
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
};
