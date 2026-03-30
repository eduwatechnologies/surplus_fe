import React from "react";
import { Mail, Phone, Instagram, Twitter, Facebook } from "lucide-react";

const ContactUs = () => {
  const contactItems = [
    {
      icon: <Phone className="text-blue-600" size={20} />,
      text: "+234 08162399919",
    },
    {
      icon: <Mail className="text-blue-600" size={20} />,
      text: "support@almaleek.com.ng",
    },
    {
      icon: <Instagram className="text-pink-500" size={20} />,
      text: "@almaleek.com.ng",
      link: "https://instagram.com/payonce.com.ng",
    },
    {
      icon: <Twitter className="text-blue-400" size={20} />,
      text: "@almaleek.com.ng",
      link: "https://twitter.com/yourpage",
    },
    {
      icon: <Facebook className="text-blue-700" size={20} />,
      text: "YourPage",
      link: "https://facebook.com/yourpage",
    },
  ];

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Contact Us
      </h2>
      <p className="text-center text-gray-500 mb-8">
        We’d love to hear from you! Reach us through any of the channels below.
      </p>

      <div className="flex flex-col gap-5 text-gray-700 text-base">
        {contactItems.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200"
          >
            {item.icon}
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline hover:text-blue-600 transition-colors"
              >
                {item.text}
              </a>
            ) : (
              <span>{item.text}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactUs;
