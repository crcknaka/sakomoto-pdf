export interface SlideImage {
  desktop: string;
  mobile?: string;
}

export interface SlideSeo {
  heading: string;
  textEn?: string;
  textIt?: string;
  textFr?: string;
}

export interface Slide {
  id: string;
  order: number;
  label: string;
  images: {
    en: SlideImage;
    fr?: SlideImage;
  };
  alt: {
    en: string;
    fr?: string;
  };
  seo: SlideSeo;
}

export interface SlidesData {
  slides: Slide[];
}
