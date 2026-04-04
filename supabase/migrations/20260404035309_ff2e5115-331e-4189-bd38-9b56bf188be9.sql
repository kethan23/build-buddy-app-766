
-- Treatment Categories (the specialty grid on the treatments page)
CREATE TABLE public.treatment_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon_name text NOT NULL DEFAULT 'Activity',
  color_class text NOT NULL DEFAULT 'text-primary',
  bg_class text NOT NULL DEFAULT 'bg-primary/10',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Treatment Listings (individual treatment info cards with cost/duration)
CREATE TABLE public.treatment_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid REFERENCES public.treatment_categories(id) ON DELETE SET NULL,
  avg_cost text,
  duration text,
  savings text,
  description text,
  icon_bg text DEFAULT 'bg-primary/10 text-primary',
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.treatment_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_listings ENABLE ROW LEVEL SECURITY;

-- Public read for active items
CREATE POLICY "Anyone can view active categories"
  ON public.treatment_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active listings"
  ON public.treatment_listings FOR SELECT
  USING (is_active = true);

-- Admin full control
CREATE POLICY "Admins can manage categories"
  ON public.treatment_categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage listings"
  ON public.treatment_listings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at triggers
CREATE TRIGGER treatment_categories_updated_at
  BEFORE UPDATE ON public.treatment_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER treatment_listings_updated_at
  BEFORE UPDATE ON public.treatment_listings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
