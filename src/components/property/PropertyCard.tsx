import React from 'react';
import { Link } from 'react-router-dom';
import { Globe2, Lock, AlertCircle, CheckCircle2, ImageOff, Trash2, Pencil, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Property {
  id: string;
  title: string;
  price: number;
  address: string;
  city: string;
  state: string;
  status: 'draft' | 'published';
  property_details: {
    propertyType: string;
    bhkType: string;
    floor: string;
    totalFloors: string;
    propertyAge: string;
    facing: string;
    builtUpArea: string;
    zone: string;
    locality: string;
    landmark: string;
    address: string;
    pinCode: string;
    rentalType: string;
    rentAmount: string;
    securityDeposit: string;
    maintenance: string;
    availableFrom: string;
    preferredTenants: string[];
    furnishing: string;
    parking: string;
    description: string;
    amenities: string[];
  };
  images?: { id: string; url: string }[];
}

interface CompletionStatus {
  isComplete: boolean;
  missingFields: string[];
  hasImages: boolean;
}

interface PropertyCardProps {
  property: Property;
  completionStatus: CompletionStatus;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, status: 'draft' | 'published') => void;
  isUpdating: boolean;
}

export function PropertyCard({ 
  property, 
  completionStatus: { isComplete, missingFields, hasImages }, 
  onDelete,
  onTogglePublish,
  isUpdating
}: PropertyCardProps) {
  return (
    <li>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 mb-1">{property.title}</h3>
            <p className="text-sm text-gray-500">
              {property.address}, {property.city}, {property.state}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              ₹{property.price.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4 flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => onTogglePublish(property.id, property.status)}
                disabled={isUpdating || !isComplete}
                className={cn(
                  "relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2",
                  property.status === 'published' ? 'bg-green-600' : 'bg-gray-200',
                  (!isComplete || isUpdating) ? 'opacity-50 cursor-not-allowed' : ''
                )}
              >
                <span className="sr-only">Toggle publish status</span>
                <span
                  className={cn(
                    "pointer-events-none relative inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    property.status === 'published' ? 'translate-x-6' : 'translate-x-0'
                  )}
                >
                  <span
                    className={cn(
                      "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
                      property.status === 'published'
                        ? 'opacity-0 duration-100 ease-out'
                        : 'opacity-100 duration-200 ease-in'
                    )}
                  >
                    <Lock className="h-4 w-4 text-gray-400" />
                  </span>
                  <span
                    className={cn(
                      "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity",
                      property.status === 'published'
                        ? 'opacity-100 duration-200 ease-in'
                        : 'opacity-0 duration-100 ease-out'
                    )}
                  >
                    <Globe2 className="h-4 w-4 text-green-600" />
                  </span>
                </span>
              </button>
            </div>
            <Link
              to={`/properties/${property.id}/preview`}
              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              title="Preview property"
            >
              <Eye className="h-4 w-4" />
            </Link>
            <Link
              to={`/properties/${property.id}/edit`}
              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              title="Edit property"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              onClick={() => onDelete(property.id)}
              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700"
              title="Delete property"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-4">
            {!hasImages && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                <ImageOff className="h-4 w-4 mr-1.5" />
                No Images
              </span>
            )}
            {isComplete ? (
              <span className="inline-flex items-center text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                All details complete
              </span>
            ) : (
              <div className="group relative">
                <span className="inline-flex items-center text-sm text-amber-600 cursor-help">
                  <AlertCircle className="h-4 w-4 mr-1.5" />
                  Incomplete details
                </span>
                <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-64 p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-sm text-gray-600 z-10">
                  <p className="font-medium mb-1">Missing requirements:</p>
                  <ul className="list-disc list-inside">
                    {!hasImages && (
                      <li className="flex items-center text-amber-600">
                        <ImageOff className="h-4 w-4 mr-1.5" />
                        Property images required
                      </li>
                    )}
                    {missingFields.map(field => (
                      <li key={field} className="capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}