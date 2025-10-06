import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Award, Search, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Hospitals = () => {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

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
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mumbai">Mumbai</SelectItem>
                            <SelectItem value="delhi">Delhi</SelectItem>
                            <SelectItem value="bangalore">Bangalore</SelectItem>
                            <SelectItem value="chennai">Chennai</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Specialty</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cardiology">Cardiology</SelectItem>
                            <SelectItem value="orthopedics">Orthopedics</SelectItem>
                            <SelectItem value="oncology">Oncology</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Accreditation</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select accreditation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="jci">JCI Accredited</SelectItem>
                            <SelectItem value="nabh">NABH Certified</SelectItem>
                            <SelectItem value="iso">ISO Certified</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button className="w-full">Apply Filters</Button>
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
                      <Input placeholder="Search hospitals..." className="pl-10 w-80" />
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

                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Card key={i} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          <div className="md:w-48 h-48 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src="/placeholder.svg"
                              alt="Hospital"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-heading font-semibold text-xl mb-1">
                                  Apollo Hospitals
                                </h3>
                                <div className="flex items-center text-sm text-muted-foreground mb-2">
                                  <MapPin className="h-4 w-4 mr-1" />
                                  Mumbai, Maharashtra
                                </div>
                              </div>
                              <Badge className="bg-success">
                                <Award className="h-3 w-3 mr-1" />
                                JCI Accredited
                              </Badge>
                            </div>
                            <div className="flex items-center mb-3">
                              <Star className="h-4 w-4 fill-warning text-warning mr-1" />
                              <span className="font-medium mr-1">4.8</span>
                              <span className="text-sm text-muted-foreground">(1,250 reviews)</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="secondary">Cardiology</Badge>
                              <Badge variant="secondary">Oncology</Badge>
                              <Badge variant="secondary">Neurology</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                              State-of-the-art facility with experienced specialists and modern
                              equipment. Offering comprehensive care across multiple specialties.
                            </p>
                            <div className="flex gap-3">
                              <Button>View Details</Button>
                              <Button variant="outline">Get Quote</Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
