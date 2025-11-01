import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Search as SearchIcon, MapPin, Star, DollarSign, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Search = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [minRating, setMinRating] = useState('');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hospitals')
        .select(`
          *,
          hospital_specialties(specialty_name),
          treatment_packages(id, name, category, price, currency, duration_days)
        `)
        .eq('verification_status', 'verified')
        .eq('is_active', true);

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

  const allSpecialties = [...new Set(
    hospitals.flatMap(h => h.hospital_specialties?.map((s: any) => s.specialty_name) || [])
  )];

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = searchTerm === "" || 
      hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hospital.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = selectedLocation === "" || hospital.city === selectedLocation;
    
    const matchesSpecialty = selectedSpecialties.length === 0 || 
      hospital.hospital_specialties?.some((s: any) => 
        selectedSpecialties.includes(s.specialty_name)
      );

    const matchesRating = minRating === "" || 
      (hospital.rating && hospital.rating >= parseFloat(minRating));

    const minPrice = hospital.treatment_packages?.length > 0
      ? Math.min(...hospital.treatment_packages.map((p: any) => Number(p.price)))
      : 0;
    const matchesPrice = minPrice >= priceRange[0] && minPrice <= priceRange[1];

    return matchesSearch && matchesLocation && matchesSpecialty && matchesRating && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/patient/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">M</span>
              </div>
              <span className="font-heading font-bold text-xl text-primary">MediConnect</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-heading font-bold mb-2">Find Your Perfect Hospital</h1>
          <p className="text-muted-foreground">Search and filter hospitals by specialty, location, and budget</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All locations</SelectItem>
                      {[...new Set(hospitals.map(h => h.city).filter(Boolean))].map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Specialties</Label>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {allSpecialties.map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox
                          id={specialty}
                          checked={selectedSpecialties.includes(specialty)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSpecialties([...selectedSpecialties, specialty]);
                            } else {
                              setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty));
                            }
                          }}
                        />
                        <Label htmlFor={specialty} className="font-normal cursor-pointer">
                          {specialty}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Price Range: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}</Label>
                  <Slider
                    min={0}
                    max={50000}
                    step={1000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Minimum Rating</Label>
                  <Select value={minRating} onValueChange={setMinRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any rating</SelectItem>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      <SelectItem value="4.0">4.0+ Stars</SelectItem>
                      <SelectItem value="3.5">3.5+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm('');
                    setPriceRange([0, 50000]);
                    setSelectedSpecialties([]);
                    setSelectedLocation('');
                    setMinRating('');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search hospitals, treatments, or specialties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="reviews">Most Reviewed</SelectItem>
                </SelectContent>
              </Select>
            </div>

{loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading hospitals...</p>
              </div>
            ) : filteredHospitals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hospitals found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setPriceRange([0, 50000]);
                    setSelectedSpecialties([]);
                    setSelectedLocation('');
                    setMinRating('');
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHospitals.map((hospital) => {
                  const minPrice = hospital.treatment_packages?.length > 0
                    ? Math.min(...hospital.treatment_packages.map((p: any) => Number(p.price)))
                    : null;
                  const maxPrice = hospital.treatment_packages?.length > 0
                    ? Math.max(...hospital.treatment_packages.map((p: any) => Number(p.price)))
                    : null;
                  const currency = hospital.treatment_packages?.[0]?.currency || 'USD';

                  return (
                    <Card key={hospital.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="grid grid-cols-1 md:grid-cols-3">
                        <div className="md:col-span-1">
                          <img
                            src={hospital.cover_image_url || hospital.logo_url || "/placeholder.svg"}
                            alt={hospital.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="md:col-span-2 p-6">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">{hospital.name}</h3>
                              <div className="flex items-center text-sm text-muted-foreground mb-2">
                                <MapPin className="h-4 w-4 mr-1" />
                                {hospital.city}, {hospital.state || hospital.country}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Star className="h-5 w-5 fill-warning text-warning mr-1" />
                              <span className="font-semibold">{hospital.rating || '0.0'}</span>
                              <span className="text-sm text-muted-foreground ml-1">
                                ({hospital.total_reviews || 0} reviews)
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {hospital.hospital_specialties?.slice(0, 3).map((spec: any) => (
                              <Badge key={spec.specialty_name} variant="secondary">
                                {spec.specialty_name}
                              </Badge>
                            ))}
                            {hospital.hospital_specialties?.length > 3 && (
                              <Badge variant="secondary">
                                +{hospital.hospital_specialties.length - 3} more
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {hospital.description || 'Quality healthcare services with modern facilities.'}
                          </p>

                          <div className="flex items-center justify-between">
                            {minPrice && maxPrice ? (
                              <div className="flex items-center text-sm">
                                <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                                <span className="font-medium">
                                  {currency} {minPrice.toLocaleString()} - {maxPrice.toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span>Contact for pricing</span>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => navigate(`/hospital/${hospital.id}`)}>
                                View Details
                              </Button>
                              <Button size="sm" onClick={() => navigate('/patient/inquiries')}>
                                Send Inquiry
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="flex justify-center mt-8">
              <div className="flex gap-2">
                <Button variant="outline" disabled>Previous</Button>
                <Button variant="outline">1</Button>
                <Button>2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
