import { supabase } from '@/integrations/supabase/client';

// Import all hospital images
import apolloCover from '@/assets/hospitals/apollo-cover.jpg';
import srikaraCover from '@/assets/hospitals/srikara-cover.jpg';
import fortisCover from '@/assets/hospitals/fortis-cover.jpg';
import medantaCover from '@/assets/hospitals/medanta-cover.jpg';
import maxCover from '@/assets/hospitals/max-cover.jpg';
import a1Cover from '@/assets/hospitals/a1-cover.jpg';

import apolloLogo from '@/assets/hospitals/apollo-logo.png';
import fortisLogo from '@/assets/hospitals/fortis-logo.png';
import medantaLogo from '@/assets/hospitals/medanta-logo.png';
import maxLogo from '@/assets/hospitals/max-logo.png';
import a1Logo from '@/assets/hospitals/a1-logo.png';

import galleryLobby from '@/assets/hospitals/gallery-lobby.jpg';
import gallerySurgery from '@/assets/hospitals/gallery-surgery.jpg';
import galleryRoom from '@/assets/hospitals/gallery-room.jpg';
import galleryIcu from '@/assets/hospitals/gallery-icu.jpg';

interface HospitalSeed {
  id: string;
  name: string;
  coverImage: string;
  logoImage: string | null;
  description: string;
  website: string | null;
  bed_capacity: number | null;
  established_year: number | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

const hospitalSeeds: HospitalSeed[] = [
  {
    id: '99a298b6-2e18-4732-8692-d4ef2c050436',
    name: 'Apollo',
    coverImage: apolloCover,
    logoImage: apolloLogo,
    description: 'Apollo Hospitals Hyderabad is a leading multi-specialty hospital and one of India\'s premier healthcare destinations. With over 1500 beds and JCI accreditation, the hospital offers world-class cardiac care, orthopedic surgery, neurosciences, oncology, and organ transplant programs. Equipped with cutting-edge robotic surgery systems, advanced imaging technology, and a dedicated international patient services wing, Apollo Hyderabad has treated patients from over 120 countries. The hospital is renowned for its centers of excellence in cardiac sciences, joint replacements, and minimally invasive surgery.',
    website: 'https://www.apollohospitals.com',
    bed_capacity: 1500,
    established_year: 1983,
    email: 'info@apollohospitals.com',
    phone: '+91-40-23607777',
    address: 'Jubilee Hills, Hyderabad, Telangana 500033',
  },
  {
    id: 'cbc17b78-21bc-4f8f-a805-a758b2ae80c1',
    name: 'Srikara',
    coverImage: srikaraCover,
    logoImage: null, // Already has a logo
    description: 'Srikara Hospitals is a premier multi-specialty healthcare chain with 9 centers across Telangana and Andhra Pradesh. Recognized as the first robotic knee replacement center in South India, Srikara leads in orthopedic excellence with advanced arthroscopic surgery, robotic joint replacements using Oxinium/Gold technology, and comprehensive cardiac care. With 7 cath lab centers, 24/7 neuro-critical care, and laser urology facilities across all locations, the hospital combines affordability with advanced medical technology. Their dedicated international patient department ensures seamless care coordination for medical tourists.',
    website: 'https://srikarahospitals.com',
    bed_capacity: 500,
    established_year: 2005,
    email: 'info@srikarahospitals.com',
    phone: '+91-40-69690000',
    address: 'RTC Cross Roads, Hyderabad, Telangana',
  },
  {
    id: '01e0661c-0a61-4eec-96ed-935fdaf19029',
    name: 'A1 Hospital',
    coverImage: a1Cover,
    logoImage: a1Logo,
    description: 'A1 Hospital in Srikakulam is a modern healthcare facility specializing in comprehensive dental care and advanced ophthalmology services. Equipped with cutting-edge diagnostic equipment and the latest treatment technologies, A1 Hospital provides personalized patient care in a comfortable, modern environment. The hospital serves as a regional center of excellence for eye care including LASIK surgery, cataract treatments, and retinal procedures, alongside a full-service dental department offering cosmetic dentistry, orthodontics, and oral surgery.',
    website: null,
    bed_capacity: 100,
    established_year: 2010,
    email: 'info@a1hospital.in',
    phone: '+91-8942-225500',
    address: 'Main Road, Srikakulam, Andhra Pradesh',
  },
  {
    id: 'f0efb79b-992f-42e1-80f2-9d1b7abcba16',
    name: 'Fortis Memorial',
    coverImage: fortisCover,
    logoImage: fortisLogo,
    description: 'Fortis Memorial Research Institute (FMRI) in Gurgaon is a flagship quaternary care hospital with JCI and NABH accreditation. Spanning over 11 acres, the 330-bed facility features 15 operation theaters and 107 ICU beds. FMRI is internationally renowned for its cutting-edge robotic surgery programs, comprehensive organ transplant services, and advanced cancer treatment protocols. The hospital houses specialized institutes for cardiac sciences, neurosciences, orthopedics, kidney & urology, and bone marrow transplant. With 24/7 emergency services and a dedicated international patient lounge, FMRI serves patients from over 60 countries.',
    website: 'https://www.fortishealthcare.com',
    bed_capacity: 330,
    established_year: 2001,
    email: 'enquiry.fmri@fortishealthcare.com',
    phone: '+91-124-4962200',
    address: 'Sector 44, Gurugram, Haryana 122002',
  },
  {
    id: 'e0a57a1d-a16f-4439-b5e6-a9b4fbf4dc5c',
    name: 'Medanta Medicity',
    coverImage: medantaCover,
    logoImage: medantaLogo,
    description: 'Medanta - The Medicity is India\'s premier super-specialty institute founded by renowned cardiac surgeon Dr. Naresh Trehan. Spread across 43 acres in Gurugram, this 1600-bed facility operates through specialized institutes covering cardiac sciences, neurosciences, bone & joint diseases, kidney & urology, oncology, and liver transplant. Medanta has performed over 20,000 cardiac surgeries and 3,000+ organ transplants with world-class success rates. The hospital features India\'s first proton therapy center for cancer treatment, a fully integrated robotic surgery program, and a dedicated International Patient Services division providing end-to-end assistance for medical tourists.',
    website: 'https://www.medanta.org',
    bed_capacity: 1600,
    established_year: 2009,
    email: 'info@medanta.org',
    phone: '+91-124-4141414',
    address: 'CH Baktawar Singh Road, Sector 38, Gurugram, Haryana 122001',
  },
  {
    id: 'f4d0c82a-a013-49dd-936f-9137bacdc1d0',
    name: 'Max Super Specialty',
    coverImage: maxCover,
    logoImage: maxLogo,
    description: 'Nanavati Max Super Speciality Hospital in Mumbai is an iconic healthcare institution inaugurated in 1950 by India\'s first Prime Minister Jawaharlal Nehru. Now part of Max Healthcare, this 350-bed facility houses 55 specialty departments with over 350 eminent consultants. The hospital features a state-of-the-art Imaging Centre spanning 10,000 sq. ft. with 3 Tesla MRI, PET-CT, and focused ultrasound surgery capabilities. Known for excellence in cancer care, advanced orthopedics, cardiac sciences, and neurosurgery, the hospital combines 70+ years of legacy with cutting-edge medical technology to deliver world-class patient outcomes.',
    website: 'https://www.nanavatimaxhospital.org',
    bed_capacity: 350,
    established_year: 1950,
    email: 'info@nanavatimaxhospital.org',
    phone: '+91-22-61347777',
    address: 'S.V. Road, Vile Parle (W), Mumbai, Maharashtra 400056',
  },
];

const galleryImages = [
  { src: galleryLobby, caption: 'Premium Reception & Lobby' },
  { src: gallerySurgery, caption: 'Advanced Operation Theater' },
  { src: galleryRoom, caption: 'Deluxe Patient Suite' },
  { src: galleryIcu, caption: 'State-of-the-Art ICU' },
];

async function urlToBlob(url: string): Promise<Blob> {
  const response = await fetch(url);
  return response.blob();
}

async function uploadImage(blob: Blob, path: string): Promise<string | null> {
  const { error } = await supabase.storage
    .from('hospital-images')
    .upload(path, blob, { cacheControl: '3600', upsert: true });
  
  if (error) {
    console.error('Upload error:', path, error);
    return null;
  }
  
  const { data } = supabase.storage.from('hospital-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function seedHospitalImages(onProgress?: (msg: string) => void) {
  const log = (msg: string) => {
    console.log(msg);
    onProgress?.(msg);
  };

  for (const hospital of hospitalSeeds) {
    log(`Processing ${hospital.name}...`);

    // Upload cover image
    const coverBlob = await urlToBlob(hospital.coverImage);
    const coverUrl = await uploadImage(coverBlob, `${hospital.id}/cover_${Date.now()}.jpg`);

    // Upload logo if available
    let logoUrl: string | null = null;
    if (hospital.logoImage) {
      const logoBlob = await urlToBlob(hospital.logoImage);
      logoUrl = await uploadImage(logoBlob, `${hospital.id}/logo_${Date.now()}.png`);
    }

    // Update hospital record
    const updateData: any = {
      description: hospital.description,
      bed_capacity: hospital.bed_capacity,
      established_year: hospital.established_year,
      email: hospital.email,
      phone: hospital.phone,
      address: hospital.address,
    };
    
    if (coverUrl) updateData.cover_image_url = coverUrl;
    if (logoUrl) updateData.logo_url = logoUrl;
    if (hospital.website) updateData.website = hospital.website;

    const { error: updateError } = await supabase
      .from('hospitals')
      .update(updateData)
      .eq('id', hospital.id);

    if (updateError) {
      log(`Error updating ${hospital.name}: ${updateError.message}`);
    } else {
      log(`✅ Updated ${hospital.name}`);
    }

    // Upload gallery images for each hospital
    for (let i = 0; i < galleryImages.length; i++) {
      const gallery = galleryImages[i];
      const blob = await urlToBlob(gallery.src);
      const imageUrl = await uploadImage(blob, `${hospital.id}/gallery_${i}_${Date.now()}.jpg`);
      
      if (imageUrl) {
        // Check if gallery entry already exists
        const { data: existing } = await supabase
          .from('hospital_gallery')
          .select('id')
          .eq('hospital_id', hospital.id)
          .eq('caption', gallery.caption);

        if (!existing || existing.length === 0) {
          await supabase.from('hospital_gallery').insert({
            hospital_id: hospital.id,
            image_url: imageUrl,
            caption: gallery.caption,
            display_order: i + 1,
          });
        }
      }
    }
    log(`📸 Gallery uploaded for ${hospital.name}`);
  }

  log('🎉 All hospitals seeded successfully!');
}
