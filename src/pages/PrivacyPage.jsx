import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer"; // Assuming you have a footer
import PrivacyPolicy from "../components/PrivacyPolicy";

const PrivacyPage = () => {
  // REMOVE the semicolon after return so the JSX is actually returned
  return (
    <>
      <Header />
      <PrivacyPolicy />
      <Footer />
    </>
  );
};

export default PrivacyPage;
