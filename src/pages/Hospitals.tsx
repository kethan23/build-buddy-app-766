import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Award, Search, SlidersHorizontal, GitCompare, Check, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useComparison } from "@/contexts/ComparisonContext";
import ComparisonBar from "@/components/hospital/ComparisonBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Hospitals = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToComparison, removeFromComparison, isSelected, canAddMore } = useComparison();
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  const handleCompareToggle = (hospital: any) => {
    if (isSelected(hospital.id)) {
      removeFromComparison(hospital.id);
    } else if (canAddMore) {
      addToComparison(hospital);
    } else {
      toast({
        title: "Maximum reached",
        description: "You can compare up to 3 hospitals at a time",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('hospitals')
        .select(`
          *,
          hospital_specialties(specialty_name),
          treatment_packages(id, name, category, price, currency)
        `)
        .eq('verification_status', 'verified')
        .eq('is_active', true);

      const { data, error } = await query;

      if (error) throw error;
      setHospitals(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load hospitals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = searchTerm === "" || 
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCity = selectedCity === "all" || hospital.city === selectedCity;
    
    const matchesSpecialty = selectedSpecialty === "all" || 
      hospital.hospital_specialties?.some((s: any) => 
        s.specialty_name === selectedSpecialty
      );

    return matchesSearch && matchesCity && matchesSpecialty;
  });

  const cities = [...new Set(hospitals.map(h => h.city).filter(Boolean))];
  const specialties = [...new Set(
    hospitals.flatMap(h => h.hospital_specialties?.map((s: any) => s.specialty_name) || [])
  )];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Premium Page Header */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/5 pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Verified Healthcare Providers
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Hospital Directory
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl">
              Find and compare India's top hospitals for your medical needs
            </p>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Premium Sidebar Filters */}
              <aside className="lg:w-72 space-y-6">
                <div className="glass-card rounded-xl p-6 sticky top-24">
                  <h3 className="font-heading font-semibold text-lg mb-5 flex items-center">
                    <div className="p-2 rounded-lg bg-primary/10 mr-3">
                      <SlidersHorizontal className="h-4 w-4 text-primary" />
                    </div>
                    Filters
                  </h3>

                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-muted-foreground">Location</label>
                      <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="All cities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All cities</SelectItem>
                          {cities.map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block text-muted-foreground">Specialty</label>
                      <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="All specialties" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All specialties</SelectItem>
                          {specialties.map(specialty => (
                            <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      variant="outline"
                      className="w-full border-border/50 hover:bg-primary/5"
                      onClick={() => {
                        setSelectedCity("all");
                        setSelectedSpecialty("all");
                        setSearchTerm("");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </aside>

              {/* Results */}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search hospitals..." 
                      className="pl-10 bg-background/50 border-border/50"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select defaultValue="rating">
                    <SelectTrigger className="w-44 bg-background/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="distance">Nearest</SelectItem>
                      <SelectItem value="price">Most Affordable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center gap-2 text-muted-foreground">
                      <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Loading hospitals...
                    </div>
                  </div>
                ) : filteredHospitals.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                      <Search className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground font-medium">No hospitals found matching your criteria.</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your filters</p>
                  </div>
                ) : (
                  <div className="space-y-4 pb-20">
                    {filteredHospitals.map((hospital, index) => (
                      <Card 
                        key={hospital.id} 
                        className={`group overflow-hidden border-0 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-medium ${
                          isSelected(hospital.id) ? 'ring-2 ring-primary shadow-glow-primary' : ''
                        }`}
                        style={{ animationDelay: `${index * 80}ms` }}
                      >
                        <CardContent className="p-5">
                          <div className="flex flex-col md:flex-row gap-5">
                            <div className="md:w-52 h-44 bg-muted rounded-xl overflow-hidden flex-shrink-0 relative">
                              <img
                                src={hospital.cover_image_url || hospital.logo_url || "/placeholder.svg"}
                                alt={hospital.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                              {/* Compare button overlay */}
                              <button
                                onClick={() => handleCompareToggle(hospital)}
                                className={`absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all backdrop-blur-sm ${
                                  isSelected(hospital.id) 
                                    ? 'bg-primary text-primary-foreground shadow-lg' 
                                    : 'bg-background/80 hover:bg-background text-foreground'
                                }`}
                              >
                                {isSelected(hospital.id) ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <GitCompare className="h-3 w-3" />
                                )}
                                {isSelected(hospital.id) ? 'Selected' : 'Compare'}
                              </button>
                              {/* Rating badge */}
                              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
                                <Star className="h-3 w-3 fill-warning text-warning" />
                                <span className="text-white text-xs font-semibold">{hospital.rating || '0.0'}</span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                <div className="min-w-0">
                                  <h3 className="font-heading font-semibold text-xl mb-1 group-hover:text-primary transition-colors truncate">
                                    {hospital.name}
                                  </h3>
                                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                                    <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                                    {hospital.city}, {hospital.state || hospital.country}
                                  </div>
                                </div>
                                {hospital.verification_status === 'verified' && (
                                  <Badge className="bg-success/10 text-success border border-success/20 flex-shrink-0 ml-2">
                                    <Award className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {hospital.hospital_specialties?.slice(0, 4).map((spec: any) => (
                                  <Badge key={spec.specialty_name} variant="secondary" className="text-xs px-2.5 py-0.5 bg-secondary/10 text-secondary border-0">
                                    {spec.specialty_name}
                                  </Badge>
                                ))}
                                {hospital.hospital_specialties?.length > 4 && (
                                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                                    +{hospital.hospital_specialties.length - 4} more
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {hospital.description || 'Quality healthcare services with modern facilities.'}
                              </p>
                              {hospital.treatment_packages?.length > 0 && (
                                <p className="text-xs text-muted-foreground/70 mb-4">
                                  {hospital.treatment_packages.length} treatment packages available
                                </p>
                              )}
                              <div className="flex gap-3 flex-wrap">
                                <Button 
                                  className="btn-gradient text-white"
                                  onClick={() => navigate(`/hospital/${hospital.id}`)}
                                >
                                  View Details
                                </Button>
                                <Button variant="outline" className="border-border/50" onClick={() => navigate('/auth?tab=signup')}>
                                  Get Quote
                                </Button>
                                <Button 
                                  variant={isSelected(hospital.id) ? "secondary" : "ghost"}
                                  onClick={() => handleCompareToggle(hospital)}
                                  className="hidden md:flex"
                                >
                                  <GitCompare className="h-4 w-4 mr-2" />
                                  {isSelected(hospital.id) ? 'Remove' : 'Compare'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <ComparisonBar />
      <Footer />
    </div>
  );
};

export default Hospitals;
