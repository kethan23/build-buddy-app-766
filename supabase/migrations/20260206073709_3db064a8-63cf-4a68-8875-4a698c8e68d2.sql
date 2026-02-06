
-- Update existing hospitals with ratings and descriptions
UPDATE hospitals SET rating = 4.8, total_reviews = 342, description = 'Leading multi-specialty hospital with world-class cardiac and orthopedic care. JCI accredited with 1500+ beds.' WHERE id = '99a298b6-2e18-4732-8692-d4ef2c050436';
UPDATE hospitals SET rating = 4.6, total_reviews = 218, description = 'Premier healthcare destination known for advanced neurology and oncology treatments with international patient services.' WHERE id = 'cbc17b78-21bc-4f8f-a805-a758b2ae80c1';
UPDATE hospitals SET rating = 4.5, total_reviews = 156, description = 'Modern hospital offering comprehensive dental and ophthalmology care with cutting-edge technology.' WHERE id = '01e0661c-0a61-4eec-96ed-935fdaf19029';

-- Insert specialties for all hospitals
INSERT INTO hospital_specialties (hospital_id, specialty_name, description) VALUES
('99a298b6-2e18-4732-8692-d4ef2c050436', 'Cardiology', 'Advanced cardiac surgery and interventional cardiology'),
('99a298b6-2e18-4732-8692-d4ef2c050436', 'Orthopedics', 'Joint replacement and spine surgery'),
('99a298b6-2e18-4732-8692-d4ef2c050436', 'Neurology', 'Brain and nervous system treatments'),
('cbc17b78-21bc-4f8f-a805-a758b2ae80c1', 'Oncology', 'Comprehensive cancer treatment center'),
('cbc17b78-21bc-4f8f-a805-a758b2ae80c1', 'Neurology', 'Advanced neurosurgery and treatments'),
('cbc17b78-21bc-4f8f-a805-a758b2ae80c1', 'General Surgery', 'Minimally invasive surgical procedures'),
('01e0661c-0a61-4eec-96ed-935fdaf19029', 'Dental Care', 'Full-service dental implants and cosmetic dentistry'),
('01e0661c-0a61-4eec-96ed-935fdaf19029', 'Ophthalmology', 'LASIK and cataract surgery'),
('01e0661c-0a61-4eec-96ed-935fdaf19029', 'Pediatrics', 'Specialized pediatric care');

-- Insert certifications
INSERT INTO hospital_certifications (hospital_id, certification_name, issuing_body) VALUES
('99a298b6-2e18-4732-8692-d4ef2c050436', 'JCI Accredited', 'Joint Commission International'),
('99a298b6-2e18-4732-8692-d4ef2c050436', 'NABH', 'National Accreditation Board'),
('cbc17b78-21bc-4f8f-a805-a758b2ae80c1', 'NABH', 'National Accreditation Board'),
('cbc17b78-21bc-4f8f-a805-a758b2ae80c1', 'ISO 9001', 'ISO'),
('01e0661c-0a61-4eec-96ed-935fdaf19029', 'ISO 9001', 'ISO');

-- Add 3 more test hospitals for a fuller carousel
INSERT INTO hospitals (user_id, name, city, country, rating, total_reviews, description, verification_status, is_active) VALUES
('dd1ac8b5-e94e-4acc-bb5a-47b4f4e562e0', 'Fortis Memorial', 'Gurgaon', 'India', 4.7, 289, 'Flagship quaternary care hospital with cutting-edge robotic surgery and comprehensive organ transplant programs.', 'verified', true),
('dd1ac8b5-e94e-4acc-bb5a-47b4f4e562e0', 'Medanta Medicity', 'Delhi', 'India', 4.9, 412, 'India''s premier super-specialty institute renowned for cardiac sciences, liver transplant, and cancer treatment.', 'verified', true),
('dd1ac8b5-e94e-4acc-bb5a-47b4f4e562e0', 'Max Super Specialty', 'Mumbai', 'India', 4.4, 178, 'State-of-the-art medical center specializing in minimally invasive surgery and advanced diagnostics.', 'verified', true);
