import { getSlides, sortSlides } from '@/lib/slides';
import SlideViewer from './components/SlideViewer';

export default async function Home() {
  const data = await getSlides();
  const slides = sortSlides(data.slides);

  return <SlideViewer slides={slides} />;
}
