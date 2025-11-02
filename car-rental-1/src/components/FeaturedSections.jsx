import React, { useEffect, useState } from 'react';
import Title from './Title';
import { assets } from '../assets/assets';
import CarCard from './CarCard';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const FeaturedSection = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        // ✅ Only fetch the first 4–5 cars
        const q = query(collection(db, 'cars'), limit(5));
        const querySnapshot = await getDocs(q);

        const carList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCars(carList);
      } catch (error) {
        console.error('Error fetching featured cars:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  return (
    <div className="flex flex-col items-center py-24 px-6 md:px-16 lg:px-24 xl:px-32">
      <div>
        <Title
          title="Featured Vehicles"
          subTitle="Explore our selection of premium vehicles available for your next adventure."
        />
      </div>

      {loading ? (
        <div className="text-center text-gray-600 mt-10">Loading cars...</div>
      ) : cars.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">No featured cars available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-18">
          {cars.map((car) => (
            <div key={car.id}>
              <CarCard car={car} />
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          navigate('/cars');
          window.scrollTo(0, 0);
        }}
        className="flex items-center justify-center gap-2 px-6 py-2 border border-borderColor hover:bg-gray-50 rounded-md mt-[72px] cursor-pointer"
      >
        Explore all cars
        <img src={assets.arrow_icon} alt="arrow" />
      </button>
    </div>
  );
};

export default FeaturedSection;
