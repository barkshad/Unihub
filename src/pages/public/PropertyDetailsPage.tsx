import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProperty, getAgent } from '@/services/firestore';
import { Property, Agent } from '@/types';
import { formatCurrency, generateWhatsAppLink } from '@/lib/utils';
import { MapPin, Phone, MessageCircle, CheckCircle, AlertCircle, User } from 'lucide-react';

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!property) return <div className="min-h-screen flex items-center justify-center">Property not found</div>;

  const isOccupied = property.status === 'occupied';
  const whatsappMessage = `Hello, I’m interested in the ${property.title} listed for ${formatCurrency(property.price)} in ${property.location}. Is it still available?`;
  const whatsappLink = agent ? generateWhatsAppLink(agent.whatsappNumber, whatsappMessage) : '#';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Media & Details */}
        <div className="lg:col-span-2 space-y-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-video bg-neutral-100 rounded-xl overflow-hidden shadow-sm">
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
                <div className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center z-10 backdrop-blur-sm">
                  <span className="bg-white text-neutral-900 px-8 py-3 rounded-full font-bold text-xl tracking-widest uppercase border border-neutral-200">
                    Occupied
                  </span>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {property.media.map((media, idx) => (
                <button
                  key={media.public_id}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-neutral-900 opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  {media.resource_type === 'video' ? (
                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white text-xs font-medium">Video</div>
                  ) : (
                    <img src={media.secure_url} alt="thumbnail" className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-neutral-200">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">{property.title}</h1>
                <div className="flex items-center text-neutral-500 mt-3 text-lg">
                  <MapPin className="w-5 h-5 mr-2" />
                  {property.location}
                </div>
              </div>
              <div className="text-left md:text-right">
                <div className="text-3xl font-bold text-neutral-900">{formatCurrency(property.price)}</div>
                <div className="text-sm text-neutral-500 font-medium mt-1">per year</div>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">Description</h2>
              <p className="text-neutral-600 whitespace-pre-line leading-relaxed text-lg">
                {property.description}
              </p>
            </div>

            <div className="mt-10">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-neutral-700 bg-neutral-50 px-4 py-3 rounded-lg border border-neutral-100">
                    <CheckCircle className="w-4 h-4 text-neutral-900 mr-3" />
                    <span className="font-medium">{feature}</span>
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
            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <h3 className="text-lg font-bold text-neutral-900 mb-6">Listing Agent</h3>
              {agent ? (
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200">
                    {agent.profilePhotoURL ? (
                      <img src={agent.profilePhotoURL} alt={agent.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-neutral-900">{agent.name}</div>
                    <div className="text-sm text-neutral-500 font-medium">Verified Agent</div>
                  </div>
                </div>
              ) : (
                <div className="text-neutral-500 mb-6">Agent information unavailable</div>
              )}

              <div className="space-y-3">
                {isOccupied ? (
                  <div className="bg-neutral-100 text-neutral-600 p-4 rounded-lg flex items-start gap-3 border border-neutral-200">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">This property is currently occupied and not available for inquiries.</p>
                  </div>
                ) : (
                  <>
                    <a 
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3.5 px-4 rounded-lg transition-colors shadow-sm"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Chat on WhatsApp
                    </a>
                    <a 
                      href={`tel:${agent?.phone}`}
                      className="flex items-center justify-center gap-2 w-full bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-900 font-bold py-3.5 px-4 rounded-lg transition-colors hover:bg-neutral-50"
                    >
                      <Phone className="w-5 h-5" />
                      Call Agent
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Safety Tips */}
            <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200">
              <h4 className="font-bold text-neutral-900 mb-3">Safety Tips</h4>
              <ul className="text-sm text-neutral-600 space-y-2.5 list-disc list-inside marker:text-neutral-400">
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
