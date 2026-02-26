import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, BedDouble } from 'lucide-react';
import { Property } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const mainImage = property.media.find(m => m.resource_type === 'image') || property.media[0];
  
  return (
    <Link to={`/properties/${property.id}`} className="group block bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {mainImage ? (
          <img 
            src={mainImage.secure_url} 
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <BedDouble className="w-12 h-12" />
          </div>
        )}
        
        {property.status === 'occupied' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-1 rounded-full font-bold text-sm tracking-wide uppercase">
              Occupied
            </span>
          </div>
        )}
        
        <div className="absolute bottom-3 left-3">
           <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-gray-900">
             {formatCurrency(property.price)}
           </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
          {property.title}
        </h3>
        <div className="mt-2 flex items-center text-gray-500 text-sm">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate">{property.location}</span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
