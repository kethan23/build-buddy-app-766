import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useComparison } from "@/contexts/ComparisonContext";
import { X, GitCompare } from "lucide-react";

const ComparisonBar = () => {
  const navigate = useNavigate();
  const { selectedHospitals, removeFromComparison, clearComparison } = useComparison();

  if (selectedHospitals.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg animate-in slide-in-from-bottom-4">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            <Badge variant="secondary" className="shrink-0">
              {selectedHospitals.length}/3 selected
            </Badge>
            <div className="flex gap-2">
              {selectedHospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full text-sm shrink-0"
                >
                  <span className="max-w-[120px] truncate">{hospital.name}</span>
                  <button
                    onClick={() => removeFromComparison(hospital.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={clearComparison}>
              Clear
            </Button>
            <Button 
              size="sm" 
              onClick={() => navigate('/compare')}
              disabled={selectedHospitals.length < 2}
            >
              <GitCompare className="h-4 w-4 mr-2" />
              Compare ({selectedHospitals.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonBar;
