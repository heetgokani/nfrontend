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
import FeatureIntro from "../components/FeatureIntro";
import HeroSection from "../components/HeroSection";
import OurFarming from "../components/OurFarming";
import RandomFeaturedProducts from "../components/RandomFeaturedProducts";
const Home = () => {
  return (
    <div>
      <Header />
      <HeroSection />
      <FeatureIntro />
      <OurFarming />
      <RandomFeaturedProducts />
      <Footer />
    </div>
  );
};

export default Home;
