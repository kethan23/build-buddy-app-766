import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import TreatmentCategories from "@/components/home/TreatmentCategories";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, DollarSign, Clock, Sparkles, ArrowRight, Star, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Treatments = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loadingPkgs, setLoadingPkgs] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    fetchPopularPackages();
    fetchListings();
  }, []);

  const fetchPopularPackages = async () => {
    try {
      setLoadingPkgs(true);
      const { data, error } = await supabase
        .from('treatment_packages')
        .select(`*, hospitals(id, name, city, country, rating)`)
        .eq('is_active', true)
        .order('popularity_score', { ascending: false })
        .limit(6);
      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoadingPkgs(false);
    }
  };

  const fetchListings = async () => {
    try {
      setLoadingListings(true);
      const { data, error } = await supabase
        .from('treatment_listings')
        .select('*, treatment_categories(name)')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoadingListings(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Premium Page Header */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl pointer-events-none" />
          
          <div className="container mx-auto px-4 relative">
            <div className="text-center max-w-3xl mx-auto animate-fade-in">
              <div className="section-badge mb-4 mx-auto w-fit">
                <Sparkles className="h-4 w-4" />
                World-Class Medical Care
              </div>
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
                Medical <span className="text-primary">Treatments</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Explore world-class medical treatments at affordable prices with India's top accredited hospitals
              </p>
            </div>
          </div>
        </section>

        {/* Treatment Categories from DB */}
        <TreatmentCategories />

        {/* Treatment Listings from DB */}
        {loadingListings ? (
          <section className="py-20">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
              </div>
            </div>
          </section>
        ) : listings.length > 0 && (
          <section className="py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />
            <div className="container mx-auto px-4 relative">
              <div className="text-center mb-14">
                <div className="section-badge mb-4 mx-auto w-fit">
                  <TrendingUp className="h-4 w-4" />
                  Cost Savings
                </div>
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
                  Most Popular <span className="text-primary">Treatments</span>
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Compare costs and save significantly on world-class medical procedures
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((treatment, index) => (
                  <Card 
                    key={treatment.id} 
                    className="group overflow-hidden border-0 bg-card/80 backdrop-blur-sm animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl ${treatment.icon_bg || 'bg-primary/10 text-primary'} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                        <DollarSign className="h-6 w-6" />
                      </div>
                      <h3 className="font-heading font-semibold text-xl mb-4 group-hover:text-primary transition-colors">
                        {treatment.name}
                      </h3>
                      <div className="space-y-3">
                        {treatment.avg_cost && (
                          <div className="flex items-center text-muted-foreground">
                            <DollarSign className="h-4 w-4 mr-2 text-primary" />
                            <span className="font-medium">{treatment.avg_cost}</span>
                          </div>
                        )}
                        {treatment.duration && (
                          <div className="flex items-center text-muted-foreground">
                            <Clock className="h-4 w-4 mr-2 text-primary" />
                            <span>{treatment.duration}</span>
                          </div>
                        )}
                        {treatment.savings && (
                          <div className="flex items-center font-medium">
                            <TrendingUp className="h-4 w-4 mr-2 text-success" />
                            <span className="text-success">{treatment.savings}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Live Treatment Packages from Database */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-transparent to-muted/30 pointer-events-none" />
          
          <div className="container mx-auto px-4 relative">
            <div className="text-center mb-14">
              <div className="section-badge mb-4 mx-auto w-fit">
                <Star className="h-4 w-4" />
                Featured Packages
              </div>
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
                Treatment <span className="text-primary">Packages</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Comprehensive treatment packages from verified hospitals with transparent pricing
              </p>
            </div>

            {loadingPkgs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden border-0">
                    <CardContent className="p-6 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-8 w-1/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg, index) => (
                  <Card 
                    key={pkg.id} 
                    className="group overflow-hidden border-0 bg-card/80 backdrop-blur-sm animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="secondary" className="text-xs">{pkg.category}</Badge>
                        {pkg.popularity_score && pkg.popularity_score > 70 && (
                          <Badge className="bg-accent text-accent-foreground text-xs">Popular</Badge>
                        )}
                      </div>
                      <h3 className="font-heading font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">{pkg.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{pkg.description}</p>

                      {pkg.hospitals && (
                        <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-muted/50">
                          <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">{pkg.hospitals.name} — {pkg.hospitals.city}, {pkg.hospitals.country}</span>
                          {pkg.hospitals.rating && (
                            <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">
                              <Star className="h-3 w-3 fill-warning text-warning" />
                              <span className="text-xs font-medium">{pkg.hospitals.rating}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2 text-primary" />
                          <span>{pkg.duration_days} days treatment</span>
                          {pkg.recovery_days && <span className="ml-1">+ {pkg.recovery_days} days recovery</span>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <p className="text-2xl font-bold text-primary">{pkg.currency} {pkg.price?.toLocaleString()}</p>
                        <Button size="sm" variant="ghost" className="group/btn" onClick={() => navigate(`/hospital/${pkg.hospital_id}`)}>
                          View<ArrowRight className="h-3 w-3 ml-1 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Treatment packages will appear here once hospitals add them.</p>
              </div>
            )}

            <div className="text-center mt-10">
              <Button size="lg" className="btn-gradient text-white px-8" onClick={() => navigate('/hospitals')}>
                Browse All Hospitals<ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Treatments;
