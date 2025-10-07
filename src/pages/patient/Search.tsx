import { useState } from 'react';
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

const Search = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  const specialties = [
    'Cardiology', 'Orthopedics', 'Oncology', 'Neurology', 
    'Dental', 'Cosmetic Surgery', 'Fertility', 'General Surgery'
  ];

  const mockHospitals = [
    {
      id: 1,
      name: 'Apollo Hospital Delhi',
      location: 'New Delhi, India',
      rating: 4.8,
      reviews: 1250,
      specialties: ['Cardiology', 'Orthopedics', 'Oncology'],
      priceRange: '$5,000 - $15,000',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=250&fit=crop',
    },
    {
      id: 2,
      name: 'Fortis Hospital Mumbai',
      location: 'Mumbai, India',
      rating: 4.7,
      reviews: 980,
      specialties: ['Neurology', 'Oncology', 'General Surgery'],
      priceRange: '$4,000 - $12,000',
      image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400&h=250&fit=crop',
    },
    {
      id: 3,
      name: 'Medanta Hospital Gurgaon',
      location: 'Gurgaon, India',
      rating: 4.9,
      reviews: 1500,
      specialties: ['Cardiology', 'Fertility', 'Cosmetic Surgery'],
      priceRange: '$6,000 - $18,000',
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400&h=250&fit=crop',
    },
  ];

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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="delhi">New Delhi</SelectItem>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="bangalore">Bangalore</SelectItem>
                      <SelectItem value="chennai">Chennai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Specialties</Label>
                  {specialties.map((specialty) => (
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
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4.5">4.5+ Stars</SelectItem>
                      <SelectItem value="4.0">4.0+ Stars</SelectItem>
                      <SelectItem value="3.5">3.5+ Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full">Apply Filters</Button>
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

            <div className="space-y-4">
              {mockHospitals.map((hospital) => (
                <Card key={hospital.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="md:col-span-1">
                      <img
                        src={hospital.image}
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
                            {hospital.location}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-5 w-5 fill-warning text-warning mr-1" />
                          <span className="font-semibold">{hospital.rating}</span>
                          <span className="text-sm text-muted-foreground ml-1">
                            ({hospital.reviews} reviews)
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {hospital.specialties.map((specialty) => (
                          <Badge key={specialty} variant="secondary">
                            {specialty}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="font-medium">{hospital.priceRange}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
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
              ))}
            </div>

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
