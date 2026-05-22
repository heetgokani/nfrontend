import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import HomeBanner from "../components/HomeBanner";
import ThreeBanner from "../components/ThreeBanner";
import TwoBanner from "../components/TwoBanner";
import FeaturedCollection from "../components/FeaturedCollection";
import Newsletter from "../components/Newsletter";
import InstagramSection from "../components/InstagramSection";
import NikeProducts from "../components/NikeProducts";
const Home = () => {
  return (
    <div>
      <Header />
      <HomeBanner />
      <ThreeBanner />

      <FeaturedCollection />
      <NikeProducts />
      <InstagramSection />

      <Footer />
    </div>
  );
};

export default Home;
