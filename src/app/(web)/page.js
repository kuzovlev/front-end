import Hero from '@/components/web/hero'
import Features from '@/components/web/features'
import Steps from '@/components/web/steps'
import SummerTrips from '@/components/web/summer-trips'
import WhyChooseUs from '@/components/web/why-choose-us'
import DriversTeam from '@/components/web/drivers-team'
import Stats from '@/components/web/stats'
import Testimonials from '@/components/web/testimonials'
import Blog from '@/components/web/blog'

export const metadata = {
  title: 'Bus Broker - Your Safe Travel Journey',
  description: 'Book your bus tickets online with Bus Broker. Safe, comfortable, and reliable bus travel services.',
  keywords: 'bus booking, online bus tickets, bus travel, safe journey, bus broker',
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Steps />
      {/*<SummerTrips />*/}
      <WhyChooseUs />
      {/*<DriversTeam />*/}
      {/*<Stats />*/}
      {/*<Testimonials />*/}
      {/*<Blog />*/}
    </>
  )
}
