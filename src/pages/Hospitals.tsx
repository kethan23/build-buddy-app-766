import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Award, Search, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

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
        {/* Page Header */}
        <section className="bg-muted/50 py-12">
          <div className="container mx-auto px-4">
            <h1 className="font-heading font-bold text-4xl mb-4">Hospital Directory</h1>
            <p className="text-muted-foreground">
              Find and compare India's top hospitals for your medical needs
            </p>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <aside className="lg:w-64 space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-heading font-semibold text-lg mb-4 flex items-center">
                      <SlidersHorizontal className="h-5 w-5 mr-2" />
                      Filters
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Location</label>
                        <Select value={selectedCity} onValueChange={setSelectedCity}>
                          <SelectTrigger>
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
                        <label className="text-sm font-medium mb-2 block">Specialty</label>
                        <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                          <SelectTrigger>
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
                        className="w-full"
                        onClick={() => {
                          setSelectedCity("all");
                          setSelectedSpecialty("all");
                          setSearchTerm("");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </aside>

              {/* Results */}
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search hospitals..." 
                        className="pl-10 w-80"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue="rating">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="distance">Nearest</SelectItem>
                        <SelectItem value="price">Most Affordable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading hospitals...</p>
                  </div>
                ) : filteredHospitals.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No hospitals found matching your criteria.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredHospitals.map((hospital) => (
                      <Card key={hospital.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-48 h-48 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={hospital.cover_image_url || hospital.logo_url || "/placeholder.svg"}
                                alt={hospital.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-heading font-semibold text-xl mb-1">
                                    {hospital.name}
                                  </h3>
                                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {hospital.city}, {hospital.state || hospital.country}
                                  </div>
                                </div>
                                {hospital.verification_status === 'verified' && (
                                  <Badge className="bg-success">
                                    <Award className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center mb-3">
                                <Star className="h-4 w-4 fill-warning text-warning mr-1" />
                                <span className="font-medium mr-1">{hospital.rating || '0.0'}</span>
                                <span className="text-sm text-muted-foreground">
                                  ({hospital.total_reviews || 0} reviews)
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {hospital.hospital_specialties?.slice(0, 4).map((spec: any) => (
                                  <Badge key={spec.specialty_name} variant="secondary">
                                    {spec.specialty_name}
                                  </Badge>
                                ))}
                                {hospital.hospital_specialties?.length > 4 && (
                                  <Badge variant="secondary">
                                    +{hospital.hospital_specialties.length - 4} more
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                {hospital.description || 'Quality healthcare services with modern facilities.'}
                              </p>
                              {hospital.treatment_packages?.length > 0 && (
                                <p className="text-xs text-muted-foreground mb-4">
                                  {hospital.treatment_packages.length} treatment packages available
                                </p>
                              )}
                              <div className="flex gap-3">
                                <Button onClick={() => navigate(`/hospital/${hospital.id}`)}>
                                  View Details
                                </Button>
                                <Button variant="outline" onClick={() => navigate('/auth?tab=signup')}>
                                  Get Quote
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
      <Footer />
    </div>
  );
};

export default Hospitals;
