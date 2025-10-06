import { Star, MapPin, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const hospitals = [
  {
    id: 1,
    name: "Apollo Hospitals",
    location: "Mumbai, Maharashtra",
    rating: 4.8,
    reviews: 1250,
    specialties: ["Cardiology", "Oncology", "Neurology"],
    accreditation: "JCI Accredited",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Fortis Healthcare",
    location: "Delhi NCR",
    rating: 4.7,
    reviews: 980,
    specialties: ["Orthopedics", "Cardiac", "Transplant"],
    accreditation: "NABH Certified",
    image: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Manipal Hospitals",
    location: "Bangalore, Karnataka",
    rating: 4.9,
    reviews: 1450,
    specialties: ["Neurosurgery", "Gastro", "Pediatrics"],
    accreditation: "JCI Accredited",
    image: "/placeholder.svg",
  },
  {
    id: 4,
    name: "Max Healthcare",
    location: "New Delhi",
    rating: 4.6,
    reviews: 870,
    specialties: ["Oncology", "Robotic Surgery", "IVF"],
    accreditation: "ISO Certified",
    image: "/placeholder.svg",
  },
];

const FeaturedHospitals = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">
            Featured <span className="text-primary">Hospitals</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            India's most trusted hospitals with world-class facilities and experienced specialists
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {hospitals.map((hospital) => (
              <CarouselItem key={hospital.id} className="md:basis-1/2 lg:basis-1/3">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted relative">
                    <img
                      src={hospital.image}
                      alt={hospital.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-3 right-3 bg-success">
                      <Award className="h-3 w-3 mr-1" />
                      {hospital.accreditation}
                    </Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-heading font-semibold text-xl mb-2">{hospital.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {hospital.location}
                    </div>
                    <div className="flex items-center mb-3">
                      <Star className="h-4 w-4 fill-warning text-warning mr-1" />
                      <span className="font-medium mr-1">{hospital.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({hospital.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hospital.specialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <Button className="w-full" variant="outline">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="text-center mt-8">
          <Button size="lg">View All Hospitals</Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedHospitals;
