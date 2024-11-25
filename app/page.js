"use client"
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Header from "./dashboard/_components/Header";
import { Globe, MapPin, Star, ChevronRight, Search, Calendar, Clock, ChevronDown } from 'lucide-react';

// Custom FAQ Accordion Component
const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        className="w-full py-4 flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{question}</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-48 pb-4' : 'max-h-0'
        }`}
      >
        <p className="text-gray-600">{answer}</p>
      </div>
    </div>
  );
};

// SearchForm component with autocomplete
const SearchForm = () => {
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [dates, setDates] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);

   // Function to handle form submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (destination) {
      router.push(`/dashboard?destination=${encodeURIComponent(destination)}&dates=${encodeURIComponent(dates)}`);
    }
  };
  
  // Function to fetch destination suggestions
  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=faf4c387b10e4227b13e06de2107946d`
      );
      setSuggestions(response.data.features);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  // Function to handle input change and fetch suggestions
  const handleInputChange = (e) => {
    const value = e.target.value;
    setDestination(value);
    if (value.length > 2) {
      fetchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Function to handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setDestination(suggestion.properties.formatted);
    setShowSuggestions(false);
  };

  // Effect to close suggestions when clicking outside the input
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl shadow-xl flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative" ref={inputRef}>
        <div className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg">
          <MapPin className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={destination}
            onChange={handleInputChange}
            placeholder="Where do you want to go?"
            className="w-full focus:outline-none text-gray-700"
          />
        </div>
        {showSuggestions && (
          <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-3 cursor-pointer hover:bg-gray-100"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.properties.formatted}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex-1 relative">
        <div className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            className="w-full focus:outline-none text-gray-700"
          />
        </div>
      </div>

      <button 
        type="submit"
        className="bg-black text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
      >
        <Search className="w-5 h-5" />
        <span>Plan Now</span>
      </button>
    </form>
  );
};

// Component to display popular destinations
const PopularDestination = ({ image, name, rating, price, description }) => (
  <div className="relative group overflow-hidden rounded-xl cursor-pointer">
    <div className="aspect-w-16 aspect-h-9">
      <div className="w-full h-72 relative">
        <img 
          src={image} 
          alt={name}
          className="object-cover w-full h-full transform transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"/>
      </div>
    </div>
    <div className="absolute bottom-0 left-0 right-0 p-4">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-white font-semibold text-xl mb-1">{name}</h3>
          <p className="text-white/80 text-sm mb-2">{description}</p>
          <div className="flex items-center text-white">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1">{rating}</span>
          </div>
        </div>
        <div className="text-white text-right">
          <p className="text-sm">Starting from</p>
          <p className="text-xl font-bold">${price}</p>
        </div>
      </div>
    </div>
  </div>
);

// Component to display testimonials
const TestimonialCard = ({ avatar, name, location, text }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center space-x-4 mb-4">
      <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
      <div>
        <h4 className="font-semibold">{name}</h4>
        <p className="text-gray-600 text-sm">{location}</p>
      </div>
    </div>
    <p className="text-gray-700">{text}</p>
  </div>
);

// Component to display stats
const StatsCard = ({ number, label }) => (
  <div className="text-center">
    <h3 className="text-4xl font-bold mb-2">{number}</h3>
    <p className="text-gray-600">{label}</p>
  </div>
);

// Main Home component
export default function Home() {
  const popularDestinations = [
    {
      name: "Paris, France",
      rating: "4.8",
      price: "799",
      description: "City of Lights & Romance",
      image: "paris.png"
    },
    {
      name: "Bali, Indonesia",
      rating: "4.9",
      price: "899",
      description: "Tropical Paradise",
      image: "bali.png"
    },
    {
      name: "Tokyo, Japan",
      rating: "4.7",
      price: "999",
      description: "Modern Meets Traditional",
      image: "tokyo.png"
    },
    {
      name: "Santorini, Greece",
      rating: "4.9",
      price: "1099",
      description: "Mediterranean Beauty",
      image: "San.png"
    },
    {
      name: "New York City, USA",
      rating: "4.6",
      price: "699",
      description: "The City That Never Sleeps",
      image: "newyork.png"
    },
    {
      name: "Dubai, UAE",
      rating: "4.8",
      price: "899",
      description: "Future of Architecture",
      image: "dubai.png"
    }
  ];

  const faqs = [
    {
      question: "How does the AI travel planning work?",
      answer: "Our AI analyzes your preferences, budget, and travel dates to create personalized itineraries. It considers factors like popular attractions, local events, and weather conditions to suggest the best experiences for your trip."
    },
    {
      question: "Can I modify my itinerary after it's generated?",
      answer: "Yes! You can easily customize any part of your itinerary. Add or remove activities, adjust timings, or change locations - our platform will automatically update your schedule accordingly."
    },
    {
      question: "What's included in the travel packages?",
      answer: "Our packages typically include accommodation, main activities, and suggested restaurants. You can also opt for additional services like flight booking, transportation, and travel insurance."
    },
    {
      question: "How far in advance should I book?",
      answer: "We recommend booking at least 3-6 months in advance for popular destinations, especially during peak season. However, our platform can also accommodate last-minute planners with quick itinerary generation."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src="home.jpg"
            alt="Travel Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Discover Your Perfect 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Travel Experience
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8">
              AI-powered travel planning that creates personalized itineraries in seconds
            </p>
            
            <SearchForm />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mt-20 py-16 bg-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatsCard number="50K+" label="Happy Travelers" />
            <StatsCard number="100+" label="Destinations" />
            <StatsCard number="4.9" label="Average Rating" />
            <StatsCard number="24/7" label="Support" />
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Popular Destinations</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularDestinations.map((destination, index) => (
              <PopularDestination key={index} {...destination} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Travelers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              avatar="sarah.png"
              name="Sarah Johnson"
              location="New York, USA"
              text="The AI-powered itinerary was perfect! It saved me hours of planning and introduced me to hidden gems I wouldn't have found otherwise."
            />
            <TestimonialCard
              avatar="David.png"
              name="David Chen"
              location="Singapore"
              text="Extremely impressed with the personalization. Every suggestion matched my interests perfectly."
            />
            <TestimonialCard
              avatar="Emma.png"
              name="Emma Williams"
              location="London, UK"
              text="The real-time updates during my trip were invaluable. It made traveling so much more convenient and stress-free."
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <FAQItem key={index} {...faq} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Stay Updated</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for travel tips, destination guides, and exclusive offers
          </p>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5"
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who plan their perfect trips with our AI-powered platform
          </p>
          <a 
            href="/dashboard"
            className="inline-block bg-white text-black px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Planning for Free
          </a>
        </div>
      </section>
    </div>
  );
}