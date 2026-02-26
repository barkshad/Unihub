import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProperty, getAgent } from '@/services/firestore';
import { Property, Agent } from '@/types';
import { formatCurrency, generateWhatsAppLink } from '@/lib/utils';
import { MapPin, Phone, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      try {
        const propData = await getProperty(id);
        if (propData) {
          setProperty(propData);
          if (propData.agentId) {
            const agentData = await getAgent(propData.agentId);
            setAgent(agentData);
          }
        }
      } catch (error) {
        console.error("Error fetching property details", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!property) return <div className="min-h-screen flex items-center justify-center">Property not found</div>;

  const isOccupied = property.status === 'occupied';
  const whatsappMessage = `Hello, I’m interested in the ${property.title} listed for ${formatCurrency(property.price)} in ${property.location}. Is it still available?`;
  const whatsappLink = agent ? generateWhatsAppLink(agent.whatsappNumber, whatsappMessage) : '#';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Media & Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden">
              {property.media[activeImageIndex]?.resource_type === 'video' ? (
                <video 
                  src={property.media[activeImageIndex].secure_url} 
                  controls 
                  className="w-full h-full object-contain"
                />
              ) : (
                <img 
                  src={property.media[activeImageIndex]?.secure_url} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              )}
              
              {isOccupied && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                  <span className="bg-red-600 text-white px-8 py-3 rounded-full font-bold text-2xl tracking-wider uppercase border-4 border-white transform -rotate-12">
                    Occupied
                  </span>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {property.media.map((media, idx) => (
                <button
                  key={media.public_id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 ${activeImageIndex === idx ? 'border-indigo-600' : 'border-transparent'}`}
                >
                  {media.resource_type === 'video' ? (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white text-xs">Video</div>
                  ) : (
                    <img src={media.secure_url} alt="thumbnail" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
                <div className="flex items-center text-gray-500 mt-2">
                  <MapPin className="w-5 h-5 mr-1" />
                  {property.location}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-indigo-600">{formatCurrency(property.price)}</div>
                <div className="text-sm text-gray-500">per year</div>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                {property.description}
              </p>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Agent & Contact */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            {/* Agent Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Listing Agent</h3>
              {agent ? (
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden">
                    {agent.profilePhotoURL ? (
                      <img src={agent.profilePhotoURL} alt={agent.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 text-xl font-bold">
                        {agent.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{agent.name}</div>
                    <div className="text-sm text-gray-500">Verified Agent</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 mb-6">Agent information unavailable</div>
              )}

              <div className="space-y-3">
                {isOccupied ? (
                  <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">This property is currently occupied and not available for inquiries.</p>
                  </div>
                ) : (
                  <>
                    <a 
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Chat on WhatsApp
                    </a>
                    <a 
                      href={`tel:${agent?.phone}`}
                      className="flex items-center justify-center gap-2 w-full bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      Call Agent
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
              <h4 className="font-semibold text-blue-900 mb-2">Safety Tips</h4>
              <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                <li>Never pay before inspection.</li>
                <li>Meet agents in open, public places.</li>
                <li>Verify the agent's identity.</li>
                <li>Inspect the property thoroughly.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
