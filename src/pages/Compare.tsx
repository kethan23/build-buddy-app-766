import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useComparison } from "@/contexts/ComparisonContext";
import { 
  Star, 
  MapPin, 
  Building2, 
  Calendar, 
  Award, 
  X, 
  Plus,
  ArrowLeft,
  Check,
  Minus
} from "lucide-react";

const Compare = () => {
  const navigate = useNavigate();
  const { selectedHospitals, removeFromComparison, clearComparison } = useComparison();

  const getMinPackagePrice = (packages: any[]) => {
    if (!packages || packages.length === 0) return null;
    const prices = packages.map(p => p.price);
    return Math.min(...prices);
  };

  const getMaxPackagePrice = (packages: any[]) => {
    if (!packages || packages.length === 0) return null;
    const prices = packages.map(p => p.price);
    return Math.max(...prices);
  };

  const formatPrice = (price: number | null, currency = "USD") => {
    if (price === null) return "N/A";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
  };

  if (selectedHospitals.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="font-heading text-2xl font-bold mb-2">No Hospitals Selected</h2>
              <p className="text-muted-foreground mb-6">
                Select up to 3 hospitals from the directory to compare their packages, ratings, and facilities.
              </p>
              <Button onClick={() => navigate('/hospitals')}>
                Browse Hospitals
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/hospitals')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="font-heading font-bold text-3xl">Compare Hospitals</h1>
                  <p className="text-muted-foreground">
                    Comparing {selectedHospitals.length} hospital{selectedHospitals.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={clearComparison}>
                  Clear All
                </Button>
                <Button onClick={() => navigate('/hospitals')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Hospital
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Hospital Headers */}
                <thead>
                  <tr>
                    <th className="p-4 text-left bg-muted/50 rounded-tl-lg font-heading font-semibold min-w-[200px]">
                      Hospital Details
                    </th>
                    {selectedHospitals.map((hospital) => (
                      <th key={hospital.id} className="p-4 bg-muted/50 min-w-[280px]">
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-destructive/10 hover:bg-destructive/20"
                            onClick={() => removeFromComparison(hospital.id)}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                          <div className="h-32 w-full bg-muted rounded-lg overflow-hidden mb-3">
                            <img
                              src={hospital.cover_image_url || hospital.logo_url || "/placeholder.svg"}
                              alt={hospital.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h3 className="font-heading font-semibold text-lg mb-1">{hospital.name}</h3>
                          <div className="flex items-center justify-center text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" />
                            {hospital.city}, {hospital.state || hospital.country}
                          </div>
                        </div>
                      </th>
                    ))}
                    {selectedHospitals.length < 3 && (
                      <th className="p-4 bg-muted/50 rounded-tr-lg min-w-[200px]">
                        <Button
                          variant="outline"
                          className="h-32 w-full border-dashed"
                          onClick={() => navigate('/hospitals')}
                        >
                          <Plus className="h-6 w-6 mr-2" />
                          Add Hospital
                        </Button>
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {/* Rating */}
                  <tr className="border-b">
                    <td className="p-4 font-medium bg-card">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 mr-2 text-warning" />
                        Rating
                      </div>
                    </td>
                    {selectedHospitals.map((hospital) => (
                      <td key={hospital.id} className="p-4 text-center bg-card">
                        <div className="flex items-center justify-center gap-2">
                          <Star className="h-5 w-5 fill-warning text-warning" />
                          <span className="font-semibold text-lg">{hospital.rating || '0.0'}</span>
                          <span className="text-sm text-muted-foreground">
                            ({hospital.total_reviews || 0} reviews)
                          </span>
                        </div>
                      </td>
                    ))}
                    {selectedHospitals.length < 3 && <td className="bg-card" />}
                  </tr>

                  {/* Established Year */}
                  <tr className="border-b">
                    <td className="p-4 font-medium bg-card">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary" />
                        Established
                      </div>
                    </td>
                    {selectedHospitals.map((hospital) => (
                      <td key={hospital.id} className="p-4 text-center bg-card">
                        {hospital.established_year || 'N/A'}
                      </td>
                    ))}
                    {selectedHospitals.length < 3 && <td className="bg-card" />}
                  </tr>

                  {/* Bed Capacity */}
                  <tr className="border-b">
                    <td className="p-4 font-medium bg-card">
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-primary" />
                        Bed Capacity
                      </div>
                    </td>
                    {selectedHospitals.map((hospital) => (
                      <td key={hospital.id} className="p-4 text-center bg-card">
                        {hospital.bed_capacity ? `${hospital.bed_capacity} beds` : 'N/A'}
                      </td>
                    ))}
                    {selectedHospitals.length < 3 && <td className="bg-card" />}
                  </tr>

                  {/* Price Range */}
                  <tr className="border-b">
                    <td className="p-4 font-medium bg-card">
                      <div className="flex items-center">
                        <span className="h-4 w-4 mr-2 font-bold text-success">$</span>
                        Price Range
                      </div>
                    </td>
                    {selectedHospitals.map((hospital) => {
                      const minPrice = getMinPackagePrice(hospital.treatment_packages || []);
                      const maxPrice = getMaxPackagePrice(hospital.treatment_packages || []);
                      const currency = hospital.treatment_packages?.[0]?.currency || 'USD';
                      return (
                        <td key={hospital.id} className="p-4 text-center bg-card">
                          {minPrice !== null ? (
                            <span className="font-semibold text-success">
                              {formatPrice(minPrice, currency)} - {formatPrice(maxPrice, currency)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">No packages</span>
                          )}
                        </td>
                      );
                    })}
                    {selectedHospitals.length < 3 && <td className="bg-card" />}
                  </tr>

                  {/* Specialties */}
                  <tr className="border-b">
                    <td className="p-4 font-medium bg-card align-top">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-2 text-accent" />
                        Specialties
                      </div>
                    </td>
                    {selectedHospitals.map((hospital) => (
                      <td key={hospital.id} className="p-4 bg-card">
                        <div className="flex flex-wrap justify-center gap-1">
                          {hospital.hospital_specialties?.length ? (
                            hospital.hospital_specialties.map((spec) => (
                              <Badge key={spec.specialty_name} variant="secondary" className="text-xs">
                                {spec.specialty_name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">None listed</span>
                          )}
                        </div>
                      </td>
                    ))}
                    {selectedHospitals.length < 3 && <td className="bg-card" />}
                  </tr>

                  {/* Treatment Packages */}
                  <tr className="border-b">
                    <td className="p-4 font-medium bg-card align-top">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 mr-2 text-success" />
                        Packages Available
                      </div>
                    </td>
                    {selectedHospitals.map((hospital) => (
                      <td key={hospital.id} className="p-4 bg-card">
                        {hospital.treatment_packages?.length ? (
                          <div className="space-y-2">
                            {hospital.treatment_packages.slice(0, 5).map((pkg) => (
                              <div key={pkg.id} className="flex justify-between text-sm border-b border-border/50 pb-1 last:border-0">
                                <span className="truncate max-w-[150px]">{pkg.name}</span>
                                <span className="font-medium text-primary">
                                  {formatPrice(pkg.price, pkg.currency)}
                                </span>
                              </div>
                            ))}
                            {hospital.treatment_packages.length > 5 && (
                              <p className="text-xs text-muted-foreground text-center">
                                +{hospital.treatment_packages.length - 5} more packages
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground flex items-center justify-center">
                            <Minus className="h-4 w-4" />
                          </span>
                        )}
                      </td>
                    ))}
                    {selectedHospitals.length < 3 && <td className="bg-card" />}
                  </tr>

                  {/* Actions */}
                  <tr>
                    <td className="p-4 bg-muted/50 rounded-bl-lg"></td>
                    {selectedHospitals.map((hospital) => (
                      <td key={hospital.id} className="p-4 bg-muted/50">
                        <div className="flex flex-col gap-2">
                          <Button 
                            className="w-full"
                            onClick={() => navigate(`/hospital/${hospital.id}`)}
                          >
                            View Details
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => navigate('/auth?tab=signup')}
                          >
                            Get Quote
                          </Button>
                        </div>
                      </td>
                    ))}
                    {selectedHospitals.length < 3 && <td className="bg-muted/50 rounded-br-lg" />}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Compare;
