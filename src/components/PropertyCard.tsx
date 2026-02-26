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
    <Link to={`/properties/${property.id}`} className="group block bg-white rounded-lg overflow-hidden border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
        {mainImage ? (
          <img 
            src={mainImage.secure_url} 
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <BedDouble className="w-12 h-12" />
          </div>
        )}
        
        {property.status === 'occupied' && (
          <div className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-white text-neutral-900 px-4 py-1.5 rounded-full font-semibold text-xs tracking-wider uppercase border border-neutral-200">
              Occupied
            </span>
          </div>
        )}
        
        <div className="absolute bottom-3 left-3">
           <span className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-md text-xs font-bold text-neutral-900 shadow-sm border border-neutral-100">
             {formatCurrency(property.price)}
           </span>
        </div>
      </div>
      
      <div className="p-5">
        <h3 className="font-semibold text-neutral-900 truncate text-lg group-hover:text-neutral-600 transition-colors">
          {property.title}
        </h3>
        <div className="mt-2 flex items-center text-neutral-500 text-sm">
          <MapPin className="w-4 h-4 mr-1.5 text-neutral-400" />
          <span className="truncate">{property.location}</span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
