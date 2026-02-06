
-- Specialties for new hospitals
INSERT INTO hospital_specialties (hospital_id, specialty_name, description) VALUES
('f0efb79b-992f-42e1-80f2-9d1b7abcba16', 'Cardiology', 'Robotic cardiac surgery center'),
('f0efb79b-992f-42e1-80f2-9d1b7abcba16', 'Orthopedics', 'Joint replacement and sports medicine'),
('e0a57a1d-a16f-4439-b5e6-a9b4fbf4dc5c', 'Oncology', 'World-class cancer treatment'),
('e0a57a1d-a16f-4439-b5e6-a9b4fbf4dc5c', 'Cardiology', 'Heart transplant and cardiac sciences'),
('e0a57a1d-a16f-4439-b5e6-a9b4fbf4dc5c', 'Neurology', 'Advanced neuro interventions'),
('f4d0c82a-a013-49dd-936f-9137bacdc1d0', 'General Surgery', 'Minimally invasive surgery'),
('f4d0c82a-a013-49dd-936f-9137bacdc1d0', 'Oncology', 'Comprehensive cancer care');

-- Certifications for new hospitals
INSERT INTO hospital_certifications (hospital_id, certification_name, issuing_body) VALUES
('f0efb79b-992f-42e1-80f2-9d1b7abcba16', 'NABH', 'National Accreditation Board'),
('e0a57a1d-a16f-4439-b5e6-a9b4fbf4dc5c', 'JCI Accredited', 'Joint Commission International'),
('e0a57a1d-a16f-4439-b5e6-a9b4fbf4dc5c', 'NABH', 'National Accreditation Board'),
('f4d0c82a-a013-49dd-936f-9137bacdc1d0', 'ISO 9001', 'ISO');
